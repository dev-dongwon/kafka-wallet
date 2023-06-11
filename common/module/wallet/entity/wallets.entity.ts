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

  @Column({ type: 'numeric', nullable: true, default: null })
  pendingWithdraw?: number | null;

  @Column({ type: 'numeric', nullable: true, default: null })
  pendingDeposit?: number | null;

  @OneToMany(
    () => TransactionHistoryEntity,
    (transaction) => transaction.wallet,
  )
  transactions: TransactionHistoryEntity[];
}
