import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ErrorMessage,
  TransactionHistoryEntity,
  WalletsEntity,
} from 'common';

@Injectable()
export class TransactionRepository {
  constructor(private dataSource: DataSource) {}

  async findById(id: number): Promise<TransactionHistoryEntity> {
    return await TransactionHistoryEntity.findOneBy({ id });
  }

  async transactionTaskWithWalletAndTransactionHistory(
    transaction: TransactionHistoryEntity,
    wallet: WalletsEntity,
  ): Promise<void> {
    try {
      await this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        await manager.save(wallet);
        await manager.save(transaction);
      });
    } catch (error) {
      throw new HttpException(
        ErrorMessage.DB_TRANSACTION_FAILED,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async transactionTaskToCreateTransactionHistory(
    transaction: TransactionHistoryEntity,
    wallet: WalletsEntity,
  ): Promise<TransactionHistoryEntity> {
    let createdTransaction: TransactionHistoryEntity;

    try {
      await this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        await manager.save(wallet);
        createdTransaction = await manager.save(transaction);
      });
    } catch (error) {
      throw new HttpException(
        ErrorMessage.FAILED_TASK_PROCESSING,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return createdTransaction;
  }
}
