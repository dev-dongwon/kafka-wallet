import { ProcessTransactionResponseInterface } from 'common';

export class ProcessTransactionsPresenter {
  completedDepositCount: number;
  completedWithdrawCount: number;

  constructor(
    processTransactionResponseInterface: ProcessTransactionResponseInterface,
  ) {
    this.completedDepositCount =
      processTransactionResponseInterface.completedDepositCount;
    this.completedWithdrawCount =
      processTransactionResponseInterface.completedWithdrawCount;
  }
}
