import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService, WalletModule } from 'common';
import { WalletController } from './wallet/wallet.controller';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
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
    ConfigModule.forRoot({
      isGlobal: true,
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
  controllers: [WalletController],
  providers: [],
})
export class ConsumerModule {}
