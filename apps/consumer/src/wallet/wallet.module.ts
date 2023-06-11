import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletsEntity } from '../../../../common/wallet/entity/wallets.entity';
import { WalletRepository } from './wallet.repository';
import { TransactionHistoryEntity } from 'common';

@Module({
  controllers: [WalletController],
  providers: [
    WalletService,
    WalletsEntity,
    TransactionHistoryEntity,
    WalletRepository,
  ],
})
export class WalletModule {}
