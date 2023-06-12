import { Test } from '@nestjs/testing';
import { TransactionService } from '../tranasaction.service';
import { TransactionRepository } from '../transaction.repository';
import { WalletService } from 'common/module/wallet/wallet.service';
import { WalletRepository } from 'common/module/wallet/wallet.repository';
import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { TransactionHistoryEntity, WalletsEntity } from 'common/module/wallet';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ErrorMessage, TransactionType } from 'common/Enums';

const transactionMockRepository = () => ({
  findById: jest.fn(),
  transactionTaskToCreateTransactionHistory: jest.fn(),
});

const walletMockService = () => ({
  findById: jest.fn(),
  create: jest.fn(),
});

// @ts-ignore
const dataSourceMockFactory: () => MockType<DataSource> = jest.fn(() => ({
  transaction: jest.fn(),
}));

type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let walletService: WalletService;
  let transactionRepository: TransactionRepository;
  let walletRepository: WalletRepository;
  let dataSourceMock: MockType<DataSource>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: WalletService,
          useValue: walletMockService(),
        },
        {
          provide: TransactionRepository,
          useValue: transactionMockRepository(),
        },
        { provide: DataSource, useFactory: dataSourceMockFactory },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get(TransactionRepository);
    walletService = module.get(WalletService);
    dataSourceMock = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(transactionService).toBeDefined();
  });

  describe('findById', () => {
    const mockWallet = new WalletsEntity();
    mockWallet.id = faker.string.uuid();
    mockWallet.availableBalance = 0;
    mockWallet.createdAt = new Date();
    mockWallet.updatedAt = new Date();
    mockWallet.pendingDeposit = 0;
    mockWallet.pendingWithdraw = 0;

    const mockTransactions = new TransactionHistoryEntity();
    mockTransactions.wallet = mockWallet;
    mockTransactions.id = faker.number.int();
    mockTransactions.amount = 10;
    mockTransactions.createdAt = new Date();
    mockTransactions.updatedAt = new Date();

    describe('when model exist', () => {
      it('should get exist model by id', async () => {
        jest
          .spyOn(transactionRepository, 'findById')
          .mockResolvedValueOnce(mockTransactions);
        const model = await transactionService.findById(mockTransactions.id);

        expect(model.id).toEqual(mockTransactions.id);
      });
    });

    describe('when not exist model', () => {
      it('should throw error', async () => {
        jest
          .spyOn(transactionRepository, 'findById')
          .mockResolvedValueOnce(mockTransactions);

        try {
          const model = await transactionService.findById(faker.number.int());
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
        }
      });
    });
  });

  describe('depositOrWithdraw', () => {
    const mockWallet = new WalletsEntity();
    mockWallet.id = faker.string.uuid();
    mockWallet.availableBalance = 100;
    mockWallet.createdAt = new Date();
    mockWallet.updatedAt = new Date();
    mockWallet.pendingDeposit = 0;
    mockWallet.pendingWithdraw = 0;

    const mockTransactions = new TransactionHistoryEntity();
    mockTransactions.wallet = mockWallet;
    mockTransactions.type = TransactionType.DEPOSIT;
    mockTransactions.id = faker.number.int();
    mockTransactions.amount = 10;
    mockTransactions.createdAt = new Date();
    mockTransactions.updatedAt = new Date();

    describe('when transaction amount is zero', () => {
      it('should throw error', async () => {
        jest.spyOn(walletService, 'findById').mockResolvedValue(mockWallet);

        try {
          const model = await transactionService.depositOrWithdraw({
            walletId: mockWallet.id,
            type: TransactionType.DEPOSIT,
            amount: 0,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UnprocessableEntityException);
          expect(error.message).toEqual(ErrorMessage.NOT_ALLOWED_TRANSACTION);
        }
      });
    });

    describe('when withdraw amount is greater than available balance', () => {
      it('should throw error', async () => {
        jest.spyOn(walletService, 'findById').mockResolvedValue(mockWallet);

        try {
          const model = await transactionService.depositOrWithdraw({
            walletId: mockWallet.id,
            type: TransactionType.WITHDRAW,
            amount: 1000000,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UnprocessableEntityException);
          expect(error.message).toEqual(ErrorMessage.BALANCE_UNDER_WITHDRAW);
        }
      });
    });

    describe('when transaction failed', () => {
      it('should throw error', async () => {
        jest.spyOn(dataSourceMock, 'transaction').mockRejectedValue;
        const spy = jest
          .spyOn(walletService, 'findById')
          .mockResolvedValue(mockWallet);

        try {
          const model = await transactionService.depositOrWithdraw({
            walletId: mockWallet.id,
            type: TransactionType.WITHDRAW,
            amount: 10,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(UnprocessableEntityException);
          expect(error.message).toEqual(ErrorMessage.FAILED_TASK_PROCESSING);
        }
      });
    });
  });

  afterAll((done) => {
    done();
  });
});
