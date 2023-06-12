import { Test } from '@nestjs/testing';
import { ApiService } from '../src/api.service';
import { ClientKafka } from '@nestjs/microservices';
import { faker } from '@faker-js/faker';
import { HttpException } from '@nestjs/common';
import { ErrorMessage } from 'common';

const apiMockService = () => ({
  createWallet: jest.fn(),
});

const kafkaMockService = () => ({
  send: jest.fn(),
});

describe('ApiService', () => {
  let apiService: ApiService;
  let kafkaClient: ClientKafka;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ApiService,
          useValue: apiMockService(),
        },
        {
          provide: ClientKafka,
          useValue: kafkaMockService(),
        },
      ],
    }).compile();

    apiService = module.get<ApiService>(ApiService);
    kafkaClient = module.get(ClientKafka);
  });

  it('should be defined', () => {
    expect(apiService).toBeDefined();
  });

  describe('when kakfa consumer throw error', () => {
    it('throws handling error', async () => {
      jest.spyOn(kafkaClient, 'send').mockImplementation(() => {
        throw new Error('User not found');
      });

      try {
        await apiService.createWallet({
          balance: faker.number.int(),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(ErrorMessage.FAILED_TASK_PROCESSING);
      }
    });
  });

  afterAll((done) => {
    done();
  });
});
