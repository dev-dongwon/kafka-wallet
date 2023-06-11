import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateWalletsDto, DepositOrWithdrawDto, EventType } from 'common';
import { Observable, catchError, lastValueFrom, of } from 'rxjs';

@Injectable()
export class ApiService implements OnModuleInit {
  constructor(@Inject('WALLET_SERVICE') private readonly client: ClientKafka) {}

  async onModuleInit() {
    Object.values(EventType).forEach((key) =>
      this.client.subscribeToResponseOf(`${key}`),
    );
    await this.client.connect();
  }

  async createWallet({ balance }: CreateWalletsDto): Promise<any> {
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
    const response = await lastValueFrom(
      this.client
        .send(EventType.DEPOSIT_OR_WITHDRAW, depositOrWithdrawDto)
        .pipe(catchError((val) => of({ error: val.message }))),
    );

    if (Object.keys(response).includes('error')) {
      throw new HttpException(
        'wallet is not created, please retry after a few seconds',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
