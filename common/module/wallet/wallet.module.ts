import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletRepository } from './wallet.repository';
import { TransactionService } from '../transaction/tranasaction.service';
import { TransactionRepository } from '../transaction/transaction.repository';

@Module({
  providers: [
    WalletService,
    WalletRepository,
    TransactionService,
    TransactionRepository,
  ],
  exports: [WalletService, TransactionService],
})
export class WalletModule {}
