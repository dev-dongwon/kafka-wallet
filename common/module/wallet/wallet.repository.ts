import { Injectable } from '@nestjs/common';
import { WalletsEntity } from 'common';

@Injectable()
export class WalletRepository {
  async create(balance: number): Promise<WalletsEntity> {
    const model = WalletsEntity.create();
    model.availableBalance = balance;
    return await model.save();
  }

  async findById(id: string): Promise<WalletsEntity> {
    return await WalletsEntity.findOneBy({ id });
  }
}
