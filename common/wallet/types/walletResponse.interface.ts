import { TransactionStatus, TransactionType } from 'common';

export interface WalletResponseInterface {
  id: string;
  availableBalance: string;
  pendingDeposit?: string;
  pendingWithdraw?: string;
  createdAt: Date;
  updatedAt: Date;
}