import { Injectable } from '@nestjs/common';
import { TransactionType, WalletStatus } from 'common/Enums/enums';
import { CommonEntity } from 'common/entity/common.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WalletsEntity } from './wallets.entity';

@Entity({
  name: 'transactions',
})
@Injectable()
export class TransactionEntity extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => WalletsEntity, (wallet) => wallet.id)
  wallet: WalletsEntity;

  @Column({ type: 'bigint', nullable: false })
  amount: string;

  @Column({ type: 'enum', name: 'transaction_type', enum: TransactionType })
  type: WalletStatus;
}
