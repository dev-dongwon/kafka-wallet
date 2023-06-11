import { ProcessTransactionResponseInterface } from 'common';
import { WalletsEntity } from '../entity/wallets.entity';

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
