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

  @Column()
  availableBalance: string;

  @Column({nullable: true, default: null })
  pendingWithdraw?: string | null;

  @Column({nullable: true, default: null })
  pendingDeposit?: string | null;

  @OneToMany(
    () => TransactionHistoryEntity,
    (transaction) => transaction.wallet,
  )
  transactions: TransactionHistoryEntity[];
}
