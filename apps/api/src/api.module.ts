import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiService } from './api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService, WalletModule } from 'common';
import { LoggerModule } from 'nestjs-pino';
import { WalletController } from './controllers/wallet.controller';
import { TransactionsController } from './controllers/transaction.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    ClientsModule.register([
      {
        name: 'WALLET_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'wallet',
            brokers: ['host.docker.internal:29092'],
          },
          consumer: {
            groupId: 'WALLET_CONSUMER',
          },
        },
      },
    ]),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    WalletModule,
  ],
  controllers: [WalletController, TransactionsController],
  providers: [ApiService],
})
export class ApiModule {}
