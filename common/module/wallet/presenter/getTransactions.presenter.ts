import {
  PaginationMetadataInterface,
  TransactionHistoryEntity,
  TransactionHistoryResponseInterface,
} from 'common';

export class GetTransactionsPresenter {
  transactions: TransactionHistoryResponseInterface[];
  metadata?: PaginationMetadataInterface;

  constructor(
    transactions: TransactionHistoryEntity[],
    metadata?: PaginationMetadataInterface,
  ) {
    this.transactions = transactions.map((r) => {
      return {
        id: r.id,
        walletId: r.wallet.id,
        amount: r.amount,
        type: r.type,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });
    this.metadata = metadata;
  }
}
