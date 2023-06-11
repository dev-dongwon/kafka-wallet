import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateWalletsDto, DepositOrWithdrawDto, EventType } from 'common';
import { WalletService } from 'common/wallet/wallet.service';
import { catchError, lastValueFrom, of } from 'rxjs';

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

  async createWallet({ balance }: CreateWalletsDto): Promise<any> {
    this.walletService.validateCreateWalletDto({ balance });

    const response = await lastValueFrom(
      this.client
        .send(EventType.CREATE_WALLET, { balance })
        .pipe(catchError((val) => of({ error: val.message }))),
    );

    if (Object.keys(response).includes('error')) {
      throw new HttpException(
        'wallet is not created, please retry after a few seconds',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

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

    if (Object.keys(response).includes('error')) {
      throw new HttpException(
        'transaction is failed, please retry after a few seconds',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return response;
  }
}
