import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiService } from './api.service';
import {
  CreateTransactionPresenter,
  CreateWalletsDto,
  TransactionHistoryEntity,
  TransactionHistoryResponseInterface,
  WalletPresenter,
  WalletResponseInterface,
  WalletsEntity,
} from 'common';
import { DepositOrWithdrawDto } from 'common/wallet/dto/depositOrWithdraw.dto';
import { WalletService } from 'common/wallet/wallet.service';

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
    const wallet = await WalletsEntity.findOneBy({ id: message.id });

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

    const transactionHistory = await TransactionHistoryEntity.findOneBy({
      id: message.id,
    });

    return new CreateTransactionPresenter(transactionHistory);
  }
}
