import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { CreateWalletsDto, DepositOrWithdrawDto } from './dto';
import { ErrorMessage, TransactionType } from 'common';
import { isUUID } from 'class-validator';
import BigNumber from 'bignumber.js';

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async findById(id: string) {
    this.validateWalletId(id);

    try {
      const existWallet = await this.walletRepository.findById(id);

      if (!existWallet) {
        throw new NotFoundException(ErrorMessage.RESOURCE_NOT_FOUND);
      }

      return existWallet;
    } catch (error) {
      throw new HttpException(
        ErrorMessage.FAILED_TASK_PROCESSING,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  public validateWalletId(id: string) {
    if (!isUUID(id)) {
      throw new UnprocessableEntityException(
        ErrorMessage.WALLET_FORMAT_VIOLATION,
      );
    }
  }

  public validateCreateWalletDto(createWalletDto: CreateWalletsDto) {
    const { balance } = createWalletDto;

    if (balance < 0) {
      throw new UnprocessableEntityException(ErrorMessage.BALANCE_UNDER_ZERO);
    }
  }

  public async validateDepositOrWithdrawDto(
    depositOrWithdrawDto: DepositOrWithdrawDto,
  ) {
    const { walletId, amount, type } = depositOrWithdrawDto;

    const existWallet = await this.findById(walletId);

    if (
      new BigNumber(existWallet.availableBalance).minus(amount).isLessThan(0) &&
      type === TransactionType.WITHDRAW
    ) {
      throw new UnprocessableEntityException(
        ErrorMessage.BALANCE_UNDER_WITHDRAW,
      );
    }
  }

  async createWallet(createWalletDto: CreateWalletsDto) {
    this.validateCreateWalletDto(createWalletDto);

    const { balance } = createWalletDto;

    try {
      return await this.walletRepository.create(balance);
    } catch (error) {
      throw new HttpException(
        ErrorMessage.CREATE_RESOURCE_FAILED,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
