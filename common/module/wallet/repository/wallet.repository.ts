import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { DataSource } from 'typeorm';
import {
  DepositOrWithdrawDto,
  TransactionHistoryEntity,
  TransactionType,
  WalletsEntity,
} from 'common';

@Injectable()
export class WalletRepository {
  constructor(private dataSource: DataSource) {}

  async createWallet(balance: number): Promise<WalletsEntity> {
    try {
      const model = WalletsEntity.create();
      model.availableBalance = balance;
      return await model.save();
    } catch (error) {
      throw new HttpException(
        'failed to create wallet',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async findOneWallet(id: string): Promise<WalletsEntity> {
    try {
      return await WalletsEntity.findOneBy({ id });
    } catch (error) {
      throw new HttpException(
        'failed to find the wallet',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async transactionDepositOrWithdraw(
    wallet: WalletsEntity,
    { amount, type }: DepositOrWithdrawDto,
  ): Promise<TransactionHistoryEntity> {
    wallet.availableBalance =
      type === TransactionType.WITHDRAW
        ? BigNumber(wallet.availableBalance).minus(amount).toNumber()
        : wallet.availableBalance;

    const historyModel = new TransactionHistoryEntity();
    historyModel.wallet = wallet;
    historyModel.amount = amount;
    historyModel.type = type;

    let updatedModel: TransactionHistoryEntity;

    try {
      await this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        await manager.save(wallet);
        updatedModel = await manager.save(historyModel);
      });
    } catch (error) {
      throw new HttpException(
        'Withdraw transaction is failed',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return updatedModel;
  }
}
