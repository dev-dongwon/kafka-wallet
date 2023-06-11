import {
  Body,
  ClassSerializerInterceptor,
  Controller,
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

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post('wallets')
  async createWallet(
    @Body() createWalletDto: CreateWalletsDto,
  ): Promise<WalletResponseInterface> {
    const message = await this.apiService.createWallet(createWalletDto);
    const createdWallet = await WalletsEntity.findOneBy({ id: message.id });

    return new WalletPresenter(createdWallet);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('wallets/transactions')
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
