import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  CreateWalletsDto,
  DepositOrWithdrawDto,
  EventType,
  TransactionHistoryEntity,
} from 'common';
import { WalletService } from 'common/module/wallet/wallet.service';
import { catchError, lastValueFrom, of } from 'rxjs';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ApiService implements OnModuleInit {
  constructor(
    @Inject('WALLET_SERVICE') private readonly client: ClientKafka,
    private readonly walletService: WalletService,
  ) {}

  async onModuleInit() {
    Object.values(EventType).forEach((key) =>
      this.client.subscribeToResponseOf(`${key}`),
    );
    await this.client.connect();
  }

  private kafkaErrorHandling(response: Object, message: string) {
    if (Object.keys(response).includes('error')) {
      throw new HttpException(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async createWallet({ balance }: CreateWalletsDto): Promise<any> {
    this.walletService.validateCreateWalletDto({ balance });

    const response = await lastValueFrom(
      this.client
        .send(EventType.CREATE_WALLET, { balance })
        .pipe(catchError((val) => of({ error: val.message }))),
    );

    this.kafkaErrorHandling(
      response,
      'wallet is not created, please retry after a few seconds',
    );

    return response;
  }

  async depositOrWithdraw(
    depositOrWithdrawDto: DepositOrWithdrawDto,
  ): Promise<any> {
    await this.walletService.validateDepositOrWithdrawDto(depositOrWithdrawDto);

    const response = await lastValueFrom(
      this.client
        .send(EventType.DEPOSIT_OR_WITHDRAW, depositOrWithdrawDto)
        .pipe(catchError((val) => of({ error: val.message }))),
    );

    this.kafkaErrorHandling(
      response,
      'transaction is failed, please retry after a few seconds',
    );

    return response;
  }

  async processTransactions(transactions: TransactionHistoryEntity[]) {
    const response = await lastValueFrom(
      this.client
        .send(EventType.PROCESS_PENDING_TRANSACTIONS, transactions)
        .pipe(catchError((val) => of({ error: val.message }))),
    );

    this.kafkaErrorHandling(
      response,
      'transaction is failed, please retry after a few seconds',
    );

    return response;
  }
}
