import { Injectable } from '@nestjs/common';
import { WalletsEntity } from '../../../../common/wallet/entity/wallets.entity';
import { WalletRepository } from './wallet.repository';

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async createUser(balance: number): Promise<WalletsEntity> {
    return await this.walletRepository.createUser(balance);
  }
}
