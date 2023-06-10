import { Injectable } from '@nestjs/common';
import { WalletsEntity } from '../../../../common/wallet/entity/wallets.entity';
import bigNumber from 'bignumber.js';
import { WalletStatus } from 'common';

@Injectable()
export class WalletRepository {
  async createUser(balance: number): Promise<WalletsEntity> {
    const model = WalletsEntity.create();

    model.availableBalance = bigNumber(balance).toString();
    model.status = WalletStatus.ACTIVE;

    return await model.save();
  }
}
