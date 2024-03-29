import { TransactionStatus, TransactionType } from "common";

export interface TransactionHistoryResponseInterface {
  id: number;
  walletId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}
