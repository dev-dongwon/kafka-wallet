import { IsEnum, IsNotEmpty, IsNumber, IsUUID, isEnum } from 'class-validator';
import { TransactionType } from 'common';

export class DepositOrWithdrawDto {
  @IsUUID()
  @IsNotEmpty()
  walletId: string;

  @IsEnum(Object.values(TransactionType))
  @IsNotEmpty()
  type: TransactionType;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
