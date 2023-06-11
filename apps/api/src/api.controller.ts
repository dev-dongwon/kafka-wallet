import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiService } from './api.service';
import {
  CreateTransactionPresenter,
  CreateWalletsDto,
  DEFAULT_GET_TRANSACTION_LIMIT,
  DEFAULT_GET_TRANSACTION_OFFSET,
  GetTransactionsPresenter,
  PaginationOrder,
  ProcessTransactionResponseInterface,
  ProcessTransactionsPresenter,
  TransactionHistoryResponseInterface,
  TransactionStatus,
  WalletPresenter,
  WalletResponseInterface,
  getTransactionsResponse,
} from 'common';
import { DepositOrWithdrawDto } from 'common/module/wallet/dto/depositOrWithdraw.dto';
import { WalletService } from 'common/module/wallet/wallet.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api')
export class ApiController {
  constructor(
    private readonly apiService: ApiService,
    private readonly walletService: WalletService,
  ) {}

  @Post('wallets')
  async createWallet(
    @Body() createWalletDto: CreateWalletsDto,
  ): Promise<WalletResponseInterface> {
    const message = await this.apiService.createWallet(createWalletDto);
    const wallet = await this.walletService.getWallet(message.id);

    return new WalletPresenter(wallet);
  }

  @Get('wallets/:id')
  async getWallet(@Param('id') id: string): Promise<WalletResponseInterface> {
    const wallet = await this.walletService.getWallet(id);

    return new WalletPresenter(wallet);
  }

  @Post('transactions')
  async depositOrWithdraw(
    @Body() depositOrWithdrawDto: DepositOrWithdrawDto,
  ): Promise<TransactionHistoryResponseInterface> {
    const message = await this.apiService.depositOrWithdraw(
      depositOrWithdrawDto,
    );

    const transactionHistory = await this.walletService.findOneTransaction(
      message.id,
    );

    return new CreateTransactionPresenter(transactionHistory);
  }

  @Patch('transactions')
  async processTransactions(): Promise<ProcessTransactionResponseInterface> {
    const { data } = await this.walletService.findAllTransactions({
      status: TransactionStatus.PENDING,
    });

    const completedCounts = await this.apiService.processTransactions(data);

    return new ProcessTransactionsPresenter(completedCounts);
  }

  @Get('transactions')
  async getTransactions(
    @Query('walletId') walletId: string,
    @Query('limit') limit?: string,
    @Query('startIndex') startIndex?: string,
    @Query('order') order?: PaginationOrder,
  ): Promise<getTransactionsResponse> {
    const { data, metadata } = await this.walletService.findAllTransactions({
      walletId,
      limit: limit ? Number(limit) : DEFAULT_GET_TRANSACTION_LIMIT,
      offset: startIndex ? Number(startIndex) : DEFAULT_GET_TRANSACTION_OFFSET,
      order: order ?? PaginationOrder.DESC,
    });

    return new GetTransactionsPresenter(data, metadata);
  }
}
