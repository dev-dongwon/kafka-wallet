import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'wallets',
})
export class Wallet extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ type: 'bigint' })
  availableBalance: string;

  @Column({ type: 'bigint', default: '0' })
  pendingBalance: string;
}
