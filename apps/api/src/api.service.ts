import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateWalletsDto, WalletsEntity } from 'common';
import { Observable, pipe } from 'rxjs';

@Injectable()
export class ApiService implements OnModuleInit {
  constructor(@Inject('WALLET_SERVICE') private readonly client: ClientKafka) {}

  async onModuleInit() {
    ['createWallet'].forEach((key) =>
      this.client.subscribeToResponseOf(`${key}`),
    );
    await this.client.connect();
  }

  createWallet({ balance }: CreateWalletsDto): Observable<any> {
    return this.client.send('createWallet', { balance });
  }
}
