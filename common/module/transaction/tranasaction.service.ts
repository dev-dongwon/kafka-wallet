import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DepositOrWithdrawDto,
  ErrorMessage,
  PaginationOrder,
  TransactionHistoryEntity,
  TransactionStatus,
  TransactionType,
  WalletsEntity,
} from 'common';
import BigNumber from 'bignumber.js';
import { DataSource } from 'typeorm';
import { WalletService } from '../wallet/wallet.service';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionRepository: TransactionRepository,
    private dataSource: DataSource,
  ) {}

  public async findById(id: number) {
    try {
      const transaction = await this.transactionRepository.findById(id);

      if (!transaction) {
        throw new NotFoundException(ErrorMessage.RESOURCE_NOT_FOUND);
      }

      return transaction;
    } catch (error) {
      throw new HttpException(
        ErrorMessage.FAILED_TASK_PROCESSING,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  public async findAllTransactions(filter: {
    limit?: number;
    offset?: number;
    type?: TransactionType;
    status?: TransactionStatus;
    walletId?: string;
    order?: PaginationOrder;
  }) {
    const queryBuilder = this.dataSource
      .getRepository(TransactionHistoryEntity)
      .createQueryBuilder('transactions')
      .leftJoinAndSelect('transactions.wallet', 'wallet');

    if (filter.walletId) {
      this.walletService.validateWalletId(filter.walletId);
      queryBuilder.andWhere('transactions.wallet = :id', {
        id: filter.walletId,
      });
    }

    if (filter.status) {
      queryBuilder.andWhere('transactions.status = :status', {
        status: filter.status,
      });
    }

    if (filter.type) {
      queryBuilder.andWhere('transactions.type = :type', { type: filter.type });
    }

    queryBuilder.orderBy(
      'transactions.createdAt',
      filter.order ?? PaginationOrder.ASC,
    );

    if (filter.limit) {
      queryBuilder.take(filter.limit);
    }

    if (filter.offset) {
      queryBuilder.skip((filter.offset - 1) * filter.limit);
    }

    const totalCount = await queryBuilder.getCount();
    const transactions = await queryBuilder.getMany();

    return {
      data: transactions,
      metadata:
        filter.limit && filter.offset
          ? {
              ...this.getPaginationMetadata(
                totalCount,
                filter.offset,
                filter.limit,
              ),
            }
          : undefined,
    };
  }

  private getPaginationMetadata(
    totalCount: number,
    currentOffset: number,
    limit: number,
  ) {
    const lastIndex = Math.ceil(totalCount / limit);
    const nextIndex = currentOffset + 1 > lastIndex ? null : currentOffset + 1;

    return {
      totalCount,
      nextIndex,
      lastIndex,
    };
  }

  private calculateToWithdrawOrDeposit(
    transaction: TransactionHistoryEntity,
    wallet: WalletsEntity,
  ) {
    if (transaction.type === TransactionType.WITHDRAW) {
      wallet.pendingWithdraw = BigNumber(wallet.pendingWithdraw)
        .minus(transaction.amount)
        .toNumber();
    }

    if (transaction.type === TransactionType.DEPOSIT) {
      wallet.pendingDeposit = BigNumber(wallet.pendingDeposit)
        .minus(transaction.amount)
        .toNumber();

      wallet.availableBalance = BigNumber(wallet.availableBalance)
        .plus(transaction.amount)
        .toNumber();
    }

    transaction.status = TransactionStatus.COMPLETED;

    return {
      updatedTransaction: transaction,
      updatedWallet: wallet,
    };
  }

  public async processPendingTransactions(
    transaction: TransactionHistoryEntity,
    wallet: WalletsEntity,
  ): Promise<void> {
    const { updatedTransaction, updatedWallet } =
      this.calculateToWithdrawOrDeposit(transaction, wallet);

    await this.transactionRepository.transactionTaskWithWalletAndTransactionHistory(
      updatedTransaction,
      updatedWallet,
    );
  }

  private calculateToCreateTransaction(
    wallet: WalletsEntity,
    { amount, type }: DepositOrWithdrawDto,
  ) {
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

    return wallet;
  }

  public async depositOrWithdraw(
    depositOrWithdrawDto: DepositOrWithdrawDto,
  ): Promise<TransactionHistoryEntity> {
    const existWallet = await this.walletService.findById(
      depositOrWithdrawDto.walletId,
    );

    const { amount, type, walletId } = depositOrWithdrawDto;

    const calculatedWallet = this.calculateToCreateTransaction(existWallet, {
      amount,
      type,
      walletId,
    });

    const historyModel = new TransactionHistoryEntity();
    historyModel.wallet = calculatedWallet;
    historyModel.amount = amount;
    historyModel.type = type;

    return await this.transactionRepository.transactionTaskToCreateTransactionHistory(
      historyModel,
      calculatedWallet,
    );
  }
}
