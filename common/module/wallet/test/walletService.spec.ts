import { Test } from '@nestjs/testing';
import { WalletService } from '../wallet.service';
import { WalletRepository } from '../wallet.repository';
import { WalletsEntity } from '../entity';
import { faker } from '@faker-js/faker';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

const mockRepository = () => ({
  findById: jest.fn(),
  create: jest.fn(),
});

describe('WalletService', () => {
  let walletService: WalletService;
  let walletRepository: WalletRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: WalletRepository,
          useValue: mockRepository(),
        },
      ],
    }).compile();

    walletService = module.get<WalletService>(WalletService);
    walletRepository = module.get(WalletRepository);
  });

  it('should be defined', () => {
    expect(walletService).toBeDefined();
  });

  describe('findById', () => {
    const mockWallet = new WalletsEntity();
    mockWallet.id = faker.string.uuid();
    mockWallet.availableBalance = 0;
    mockWallet.createdAt = new Date();
    mockWallet.updatedAt = new Date();

    describe('when model exist', () => {
      it('should get exist model by id', async () => {
        jest
          .spyOn(walletRepository, 'findById')
          .mockResolvedValueOnce(mockWallet);
        const model = await walletService.findById(mockWallet.id);

        expect(model.id).toEqual(mockWallet.id);
      });
    });

    describe('when id is not uuid format', () => {
      it('should throw error', async () => {
        jest
          .spyOn(walletRepository, 'findById')
          .mockResolvedValueOnce(mockWallet);

        try {
          const model = await walletService.findById(faker.word.noun());
        } catch (error) {
          expect(error).toBeInstanceOf(UnprocessableEntityException);
        }
      });
    });

    describe('when not exist model', () => {
      it('should throw error', async () => {
        jest
          .spyOn(walletRepository, 'findById')
          .mockResolvedValueOnce(mockWallet);

        try {
          const model = await walletService.findById(faker.string.uuid());
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundException);
        }
      });
    });
  });

  describe('create', () => {
    const mockWallet = new WalletsEntity();
    mockWallet.id = faker.string.uuid();
    mockWallet.availableBalance = 0;
    mockWallet.createdAt = new Date();
    mockWallet.updatedAt = new Date();

    describe('when given minus balance', () => {
      it('should throw error', async () => {
        jest
          .spyOn(walletRepository, 'create')
          .mockResolvedValueOnce(mockWallet);

        try {
          const model = await walletService.createWallet({ balance: -1 });
        } catch (error) {
          expect(error).toBeInstanceOf(UnprocessableEntityException);
        }
      });
    });
  });

  afterAll((done) => {
    done();
  });
});
