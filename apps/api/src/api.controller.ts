import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiService } from './api.service';
import {
  CreateWalletsDto,
  WalletPresenter,
  WalletResponseInterface,
  WalletsEntity,
} from 'common';
import { lastValueFrom } from 'rxjs';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post('wallets')
  async createWallet(
    @Body() createWalletDto: CreateWalletsDto,
  ): Promise<WalletResponseInterface> {
    const a = await lastValueFrom(
      this.apiService.createWallet(createWalletDto),
    );

    const createdWallet = await WalletsEntity.findOneBy({ id: a.id });

    if (!createdWallet) {
      throw new HttpException(
        'wallet is not created, please retry after a few seconds',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return new WalletPresenter(createdWallet);
  }
}
