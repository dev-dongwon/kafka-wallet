import { Injectable } from '@nestjs/common';
import { CommonEntity } from 'common/entity/common.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionHistoryEntity } from './transaction.entity';

@Entity({
  name: 'wallets',
})
@Injectable()
export class WalletsEntity extends CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric' })
  availableBalance: number;

  @Column({ type: 'numeric', default: 0 })
  pendingWithdraw: number;

  @Column({ type: 'numeric', default: 0 })
  pendingDeposit: number;

  @OneToMany(
    () => TransactionHistoryEntity,
    (transaction) => transaction.wallet,
  )
  transactions: TransactionHistoryEntity[];
}
