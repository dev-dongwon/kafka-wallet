import { TransactionStatus, TransactionType } from 'common';

export interface WalletResponseInterface {
  id: string;
  availableBalance: number;
  pendingDeposit?: number;
  pendingWithdraw?: number;
  createdAt: Date;
  updatedAt: Date;
}