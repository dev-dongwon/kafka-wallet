import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { TransactionType } from 'common';

export class DepositOrWithdrawDto {
  @IsUUID()
  @IsNotEmpty()
  walletId: string;

  @IsNumber()
  @IsNotEmpty()
  type: TransactionType;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
