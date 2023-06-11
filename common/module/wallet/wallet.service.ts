import {
  HttpException,
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { CreateWalletsDto, DepositOrWithdrawDto } from './dto';
import {
  PaginationOrder,
  TransactionHistoryEntity,
  TransactionStatus,
  TransactionType,
  WalletsEntity,
} from 'common';
import { isUUID } from 'class-validator';
import BigNumber from 'bignumber.js';
import { DataSource } from 'typeorm';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private dataSource: DataSource,
  ) {}

  async getWallet(id: string) {
    this.validateWalletId(id);
    return await this.walletRepository.findOneWallet(id);
  }

  async findOneTransaction(id: number) {
    return await this.walletRepository.findOneTransactions(id);
  }

  public validateWalletId(id: string) {
    if (!isUUID(id)) {
      throw new UnprocessableEntityException('wallet Id must be uuid format');
    }
  }

  public validateCreateWalletDto(createWalletDto: CreateWalletsDto) {
    const { balance } = createWalletDto;

    if (balance < 0) {
      throw new UnprocessableEntityException('balance must be greater than 0');
    }
  }

  public async validateDepositOrWithdrawDto(
    depositOrWithdrawDto: DepositOrWithdrawDto,
  ) {
    const { walletId, amount, type } = depositOrWithdrawDto;

    const existWallet = await this.getWallet(walletId);

    if (
      new BigNumber(existWallet.availableBalance).minus(amount).isLessThan(0) &&
      type === TransactionType.WITHDRAW
    ) {
      throw new UnprocessableEntityException(
        'availableBalance must be greater than withdraw amount',
      );
    }
  }

  async createWallet(createWalletDto: CreateWalletsDto) {
    this.validateCreateWalletDto(createWalletDto);

    const { balance } = createWalletDto;
    return await this.walletRepository.create(balance);
  }

  async depositOrWithdraw(
    depositOrWithdrawDto: DepositOrWithdrawDto,
  ): Promise<TransactionHistoryEntity> {
    const existWallet = await this.walletRepository.findOneWallet(
      depositOrWithdrawDto.walletId,
    );

    return await this.walletRepository.createTransactionHistory(
      existWallet,
      depositOrWithdrawDto,
    );
  }

  async findAllTransactions(filter: {
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
      this.validateWalletId(filter.walletId);
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

  async processPendingTransactions(
    transaction: TransactionHistoryEntity,
    wallet: WalletsEntity,
  ): Promise<void> {
    if (transaction.type === TransactionType.WITHDRAW) {
      wallet.pendingWithdraw = BigNumber(wallet.pendingWithdraw)
        .minus(transaction.amount)
        .toNumber();
    }

    if (transaction.type === TransactionType.DEPOSIT) {
      wallet.pendingDeposit = BigNumber(wallet.pendingDeposit)
        .minus(transaction.amount)
        .toNumber();
    }

    transaction.status = TransactionStatus.COMPLETED;

    try {
      await this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        await manager.save(wallet);
        await manager.save(transaction);
      });
    } catch (error) {
      throw new HttpException(
        'transaction is failed',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
