import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { TypeOrmConfigService } from 'apps/api/src/lib';

@Module({
  imports: [
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
  ],
  controllers: [ApiController],
  providers: [ApiService, TypeOrmConfigService],
})
export class ApiModule {}
