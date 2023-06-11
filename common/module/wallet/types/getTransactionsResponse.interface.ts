import { TransactionHistoryResponseInterface } from 'common';

export interface getTransactionsResponse {
  transactions: TransactionHistoryResponseInterface[];
  metadata?: PaginationMetadataInterface;
}

export interface PaginationMetadataInterface {
  totalCount: number;
  nextIndex: number | null;
  lastIndex: number;
}
