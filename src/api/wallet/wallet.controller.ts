import { Controller, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller('wallet')
export class WalletController {
  constructor(@Inject('WALLET_SERVICE') private readonly client: ClientKafka) {}
}
