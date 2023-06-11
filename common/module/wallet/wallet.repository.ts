import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async create(balance: number): Promise<WalletsEntity> {
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
      const existWallet = await WalletsEntity.findOneBy({ id });

      if (!existWallet) {
        throw new NotFoundException('wallet not found');
      }

      return existWallet;
    } catch (error) {
      throw new HttpException(
        'failed to find the wallet',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async findOneTransactions(id: number): Promise<TransactionHistoryEntity> {
    try {
      const transaction = await TransactionHistoryEntity.findOneBy({ id });

      if (!transaction) {
        throw new NotFoundException('transaction not found');
      }

      return transaction;
    } catch (error) {
      throw new HttpException(
        'failed to find the transaction',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async createTransactionHistory(
    wallet: WalletsEntity,
    { amount, type }: DepositOrWithdrawDto,
  ): Promise<TransactionHistoryEntity> {
    wallet.availableBalance =
      type === TransactionType.WITHDRAW
        ? BigNumber(wallet.availableBalance).minus(amount).toNumber()
        : wallet.availableBalance;

    switch (type) {
      case TransactionType.DEPOSIT:
        wallet.pendingDeposit = BigNumber(wallet.pendingDeposit)
          .plus(amount)
          .toNumber();
        break;
      case TransactionType.WITHDRAW:
        wallet.pendingWithdraw = BigNumber(wallet.pendingWithdraw)
          .plus(amount)
          .toNumber();
        break;
      default:
        break;
    }

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
