import {
  TransactionHistoryEntity,
  TransactionStatus,
  TransactionType,
} from 'common';

export class CreateTransactionPresenter {
  id: number;
  walletId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(model: TransactionHistoryEntity) {
    this.id = model.id;
    this.walletId = model.wallet.id;
    this.amount = model.amount;
    this.type = model.type;
    this.status = model.status;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
  }
}
