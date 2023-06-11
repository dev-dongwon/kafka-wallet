export enum TransactionStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
}

export enum TransactionType {
  WITHDRAW = 'withdraw',
  DEPOSIT = 'deposit',
}

export enum EventType {
  CREATE_WALLET = 'createWallet',
  DEPOSIT_OR_WITHDRAW = 'depositOrWithdraw',
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}
