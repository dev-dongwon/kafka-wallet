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
  ProcessTransactionResponseInterface,
  TransactionHistoryEntity,
  TransactionType,
  WalletsEntity,
} from 'common';
import { TransactionService } from 'common/module/transaction/tranasaction.service';
import { WalletService } from 'common/module/wallet/wallet.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
  ) {}

  @MessagePattern(EventType.CREATE_WALLET)
  async createWallet(
    @Payload() message: { balance: number },
    @Ctx() context: KafkaContext,
  ): Promise<WalletsEntity> {
    return await this.walletService.createWallet({ balance: message.balance });
  }

  @MessagePattern(EventType.DEPOSIT_OR_WITHDRAW)
  async createTransactionHistory(
    @Payload() message: DepositOrWithdrawDto,
    @Ctx() context: KafkaContext,
  ): Promise<TransactionHistoryEntity> {
    return await this.transactionService.depositOrWithdraw(message);
  }

  @MessagePattern(EventType.PROCESS_PENDING_TRANSACTIONS)
  async processPendingTransactions(
    @Payload() message: TransactionHistoryEntity[],
    @Ctx() context: KafkaContext,
  ): Promise<ProcessTransactionResponseInterface> {
    for (const transaction of message) {
      const tx = await this.transactionService.findById(transaction.id);
      const wallet = await this.walletService.findById(transaction.wallet.id);

      await this.transactionService.processPendingTransactions(tx, wallet);
    }

    return {
      completedDepositCount: message.filter(
        (r) => r.type === TransactionType.DEPOSIT,
      ).length,
      completedWithdrawCount: message.filter(
        (r) => r.type === TransactionType.WITHDRAW,
      ).length,
    };
  }
}
