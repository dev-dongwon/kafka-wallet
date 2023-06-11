export enum ErrorMessage {
  RESOURCE_NOT_FOUND = 'resource is not found',
  FAILED_TASK_PROCESSING = 'failed to process task',
  CREATE_RESOURCE_FAILED = 'failed to create resource, please retry after a few seconds',
  WALLET_FORMAT_VIOLATION = 'wallet Id must be uuid format',
  BALANCE_UNDER_ZERO = 'balance must be greater than 0',
  BALANCE_UNDER_WITHDRAW = 'availableBalance must be greater than withdraw amount',
  DB_TRANSACTION_FAILED = 'database transaction is failed',
}
