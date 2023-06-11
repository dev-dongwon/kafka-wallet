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
import {
  DepositOrWithdrawDto,
  EventType,
  TransactionHistoryEntity,
  WalletsEntity,
} from 'common';
import { WalletService } from 'common/module/wallet/wallet.service';

@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @MessagePattern(EventType.CREATE_WALLET)
  async createWallet(
    @Payload() message: { balance: number },
    @Ctx() context: KafkaContext,
  ): Promise<WalletsEntity> {
    return await this.walletService.createWallet({balance: message.balance});
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @MessagePattern(EventType.DEPOSIT_OR_WITHDRAW)
  async createTransactionHistory(
    @Payload() message: DepositOrWithdrawDto,
    @Ctx() context: KafkaContext,
  ): Promise<TransactionHistoryEntity> {
    return await this.walletService.depositOrWithdraw(message);
  }
}
