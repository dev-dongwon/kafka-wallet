import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PaginationOrder, TransactionStatus } from 'common';

export class GetTransactionsDto {
  @IsNotEmpty()
  walletId: string;

  @IsOptional()
  limit?: string;

  @IsOptional()
  startIndex?: string;

  @IsOptional()
  @IsEnum(Object.values(PaginationOrder))
  order?: PaginationOrder;

  @IsOptional()
  @IsEnum(Object.values(TransactionStatus))
  status?: TransactionStatus;
}
