import { Test } from '@nestjs/testing';
import { TransactionService } from '../tranasaction.service';
import { TransactionRepository } from '../transaction.repository';
import { WalletService } from 'common/module/wallet/wallet.service';
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
  buildQueryForFindAllTransactions: jest.fn(),
});

const walletMockService = () => ({
  findById: jest.fn(),
  create: jest.fn(),
});

const dataSourceMockFactory: () => MockType<DataSource> = jest.fn(() => ({
  getRepository: jest.fn(),
  createQueryBuilder: jest.fn(),
  transaction: jest.fn(),
  leftJoinAndSelect: jest.fn(),
}));

type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let walletService: WalletService;
  let transactionRepository: TransactionRepository;
  let dataSourceMock: MockType<DataSource>;

  const mockWallet = new WalletsEntity();
  mockWallet.id = faker.string.uuid();
  mockWallet.availableBalance = 0;
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
    mockWallet.availableBalance = 100;
    mockTransactions.type = TransactionType.DEPOSIT;
    mockTransactions.amount = 10;

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

  describe('findAllTransactions', () => {
    const mockData = new Array(faker.number.int({ max: 20 })).fill(
      mockTransactions,
    ) as TransactionHistoryEntity[];

    describe('when limit and offset are not given', () => {
      let limit: number;
      let offset: number;

      it('should get only transaction data', async () => {
        jest
          .spyOn(transactionService, 'buildQueryForFindAllTransactions')
          .mockResolvedValueOnce({
            totalCount: mockData.length,
            data: mockData,
          });

        const { metadata, data } = await transactionService.findAllTransactions(
          {
            limit,
            offset,
          },
        );

        expect(metadata).toBeUndefined();
        expect(data).toEqual(data);
      });
    });

    describe('when current offset is lastOffset ', () => {
      let limit = 50;
      let offset = 1;

      it('should be null nextIndex', async () => {
        jest
          .spyOn(transactionService, 'buildQueryForFindAllTransactions')
          .mockResolvedValueOnce({
            totalCount: mockData.length,
            data: mockData,
          });

        const { metadata, data } = await transactionService.findAllTransactions(
          {
            limit,
            offset,
          },
        );

        expect(metadata.nextIndex).toBeNull();
        expect(data).toEqual(data);
      });
    });
  });

  afterAll((done) => {
    done();
  });
});
