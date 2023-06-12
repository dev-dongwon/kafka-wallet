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

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/transactions')
export class TransactionsController {
  constructor(
    private readonly apiService: ApiService,
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
  ) {}
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

  @Patch('')
  async processTransactions(): Promise<ProcessTransactionResponseInterface> {
    const { data } = await this.transactionService.findAllTransactions({
      status: TransactionStatus.PENDING,
    });

    const completedCounts = await this.apiService.processTransactions(data);

    return new ProcessTransactionsPresenter(completedCounts);
  }

  @Get('')
  async getTransactions(
    @Query('walletId') walletId: string,
    @Query('limit') limit?: string,
    @Query('startIndex') startIndex?: string,
    @Query('order') order?: PaginationOrder,
  ): Promise<getTransactionsResponse> {
    const { data, metadata } =
      await this.transactionService.findAllTransactions({
        walletId,
        limit: limit ? Number(limit) : DEFAULT_GET_TRANSACTION_LIMIT,
        offset: startIndex
          ? Number(startIndex)
          : DEFAULT_GET_TRANSACTION_OFFSET,
        order: order ?? PaginationOrder.DESC,
      });

    return new GetTransactionsPresenter(data, metadata);
  }
}
