import { Injectable } from '@nestjs/common';
import { TransactionStatus, TransactionType } from 'common/Enums/enums';
import { CommonEntity } from 'common/entity/common.entity';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletsEntity } from './wallets.entity';

@Entity({
  name: 'transaction_history',
})
@Injectable()
export class TransactionHistoryEntity extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => WalletsEntity, (wallet) => wallet.id, { eager: true })
  wallet: WalletsEntity;

  @Column({ type: 'numeric', nullable: false })
  amount: number;

  @Index()
  @Column({ type: 'enum', name: 'type', enum: TransactionType })
  type: TransactionType;

  @Index()
  @Column({
    type: 'enum',
    name: 'status',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;
}
