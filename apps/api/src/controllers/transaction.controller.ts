import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiService } from '../api.service';
import {
  CreateTransactionPresenter,
  DEFAULT_GET_TRANSACTION_LIMIT,
  DEFAULT_GET_TRANSACTION_OFFSET,
  GetTransactionsPresenter,
  PaginationOrder,
  ProcessTransactionResponseInterface,
  ProcessTransactionsPresenter,
  TransactionHistoryResponseInterface,
  TransactionStatus,
  getTransactionsResponse,
} from 'common';
import { DepositOrWithdrawDto } from 'common/module/wallet/dto/depositOrWithdraw.dto';
import { WalletService } from 'common/module/wallet/wallet.service';
import { TransactionService } from 'common/module/transaction/tranasaction.service';
import { GetTransactionsDto } from 'common/module/wallet/dto/getTransactions.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/transactions')
export class TransactionsController {
  constructor(
    private readonly apiService: ApiService,
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
  ) {}
  // 입출금 엔드 포인트
  @Post('')
  async depositOrWithdraw(
    @Body() depositOrWithdrawDto: DepositOrWithdrawDto,
  ): Promise<TransactionHistoryResponseInterface> {
    const message = await this.apiService.depositOrWithdraw(
      depositOrWithdrawDto,
    );

    const transactionHistory = await this.transactionService.findById(
      message.id,
    );

    return new CreateTransactionPresenter(transactionHistory);
  }

  // 거래 처리 엔드 포인트
  @Patch('')
  async processTransactions(): Promise<ProcessTransactionResponseInterface> {
    const { data } = await this.transactionService.findAllTransactions({
      status: TransactionStatus.PENDING,
    });

    const completedCounts = await this.apiService.processTransactions(data);

    return new ProcessTransactionsPresenter(completedCounts);
  }

  // 거래 내역 리스트 조회 엔드 포인트
  @Get('')
  async getTransactions(
    @Query() getTransactionDto: GetTransactionsDto
  ): Promise<getTransactionsResponse> {
    const { walletId, limit, startIndex, order, status } = getTransactionDto
    const { data, metadata } =
      await this.transactionService.findAllTransactions({
        walletId,
        limit: limit ? Number(limit) : DEFAULT_GET_TRANSACTION_LIMIT,
        offset: startIndex
          ? Number(startIndex)
          : DEFAULT_GET_TRANSACTION_OFFSET,
        order: order ?? PaginationOrder.DESC,
        status: status ?? undefined,
      });

    return new GetTransactionsPresenter(data, metadata);
  }
}
