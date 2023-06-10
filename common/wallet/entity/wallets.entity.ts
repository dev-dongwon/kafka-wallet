import { Injectable } from '@nestjs/common';
import { WalletStatus } from 'common/Enums/enums';
import { CommonEntity } from 'common/entity/common.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TransactionEntity } from './transaction.entity';

@Entity({
  name: 'wallets',
})
@Injectable()
export class WalletsEntity extends CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint' })
  availableBalance: string;

  @Column({ type: 'bigint', nullable: true, default: null })
  pendingBalance?: string | null;

  @Column({ type: 'enum', name: 'wallet_status', enum: WalletStatus })
  status!: WalletStatus;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.wallet)
  transactions: TransactionEntity[];
}
