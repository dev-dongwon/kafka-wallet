import {
  ClassSerializerInterceptor,
  Controller,
  UseInterceptors,
} from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { WalletService } from './wallet.service';
import { WalletsEntity } from 'common';

@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @MessagePattern('createWallet')
  async createWallet(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ): Promise<WalletsEntity> {
    const user = await this.walletService.createUser(4);
    console.log('this is message', user);

    return user;
  }
}
