import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { CreateWalletsDto, DepositOrWithdrawDto } from './dto';
import { TransactionHistoryEntity, TransactionType } from 'common';
import { isUUID } from 'class-validator';
import BigNumber from 'bignumber.js';

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async getWallet(id: string) {
    this.validateGetWalletDto(id);
    return await this.walletRepository.findOneWallet(id);
  }

  public validateGetWalletDto(id: string) {
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
      new BigNumber(existWallet.availableBalance).isLessThan(
        BigNumber(amount),
      ) &&
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
}
