import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiService } from './api.service';
import {
  CreateTransactionPresenter,
  CreateWalletsDto,
  ProcessTransactionResponseInterface,
  ProcessTransactionsPresenter,
  TransactionHistoryResponseInterface,
  TransactionStatus,
  TransactionType,
  WalletPresenter,
  WalletResponseInterface,
} from 'common';
import { DepositOrWithdrawDto } from 'common/module/wallet/dto/depositOrWithdraw.dto';
import { WalletService } from 'common/module/wallet/wallet.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/wallets')
export class ApiController {
  constructor(
    private readonly apiService: ApiService,
    private readonly walletService: WalletService,
  ) {}

  @Post('')
  async createWallet(
    @Body() createWalletDto: CreateWalletsDto,
  ): Promise<WalletResponseInterface> {
    const message = await this.apiService.createWallet(createWalletDto);
    const wallet = await this.walletService.getWallet(message.id);

    return new WalletPresenter(wallet);
  }

  @Get(':id')
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
    const pendingTransactions = await this.walletService.findAllTransactions({
      status: TransactionStatus.PENDING,
    });

    const completedCounts = await this.apiService.processTransactions(
      pendingTransactions,
    );

    return new ProcessTransactionsPresenter(completedCounts);
  }
}
