import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiService } from '../api.service';
import {
  CreateWalletsDto,
  WalletPresenter,
  WalletResponseInterface,
} from 'common';
import { WalletService } from 'common/module/wallet/wallet.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/wallets')
export class WalletController {
  constructor(
    private readonly apiService: ApiService,
    private readonly walletService: WalletService,
  ) {}

  // 지갑 생성 엔드 포인트
  @Post('')
  async createWallet(
    @Body() createWalletDto: CreateWalletsDto,
  ): Promise<WalletResponseInterface> {
    const message = await this.apiService.createWallet(createWalletDto);
    const wallet = await this.walletService.findById(message.id);

    return new WalletPresenter(wallet);
  }

  // 지갑 조회 엔드 포인트
  @Get(':id')
  async getWallet(@Param('id') id: string): Promise<WalletResponseInterface> {
    const wallet = await this.walletService.findById(id);

    return new WalletPresenter(wallet);
  }
}
