import { Injectable } from '@nestjs/common';
import { TransactionStatus, TransactionType } from 'common/Enums/enums';
import { CommonEntity } from 'common/entity/common.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WalletsEntity } from './wallets.entity';

@Entity({
  name: 'transactions',
})
@Injectable()
export class TransactionHistoryEntity extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => WalletsEntity, (wallet) => wallet.id, { eager: true })
  wallet: WalletsEntity;

  @Column({ nullable: false })
  amount: string;

  @Column({ type: 'enum', name: 'type', enum: TransactionType })
  type: TransactionType;

  @Column({
    type: 'enum',
    name: 'status',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;
}
