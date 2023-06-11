import { Injectable } from '@nestjs/common';
import { WalletsEntity } from '../../../../common/wallet/entity/wallets.entity';
import { WalletRepository } from './wallet.repository';
import { TransactionHistoryEntity } from 'common/wallet/entity/transaction.entity';
import { DepositOrWithdrawDto, TransactionType } from 'common';

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async createWallet(balance: number): Promise<WalletsEntity> {
    return await this.walletRepository.createWallet(balance);
  }

  async depositOrWithdraw(
    depositOrWithdrawDto: DepositOrWithdrawDto,
  ): Promise<TransactionHistoryEntity> {
    const existWallet = await this.walletRepository.findOneWallet(
      depositOrWithdrawDto.walletId,
    );

    return await this.walletRepository.transactionDepositOrWithdraw(
      existWallet,
      depositOrWithdrawDto,
    );
  }
}
