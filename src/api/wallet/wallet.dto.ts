import { IsNotEmpty, IsNumber } from 'class-validator';

export class createWalletDto {
  @IsNumber()
  @IsNotEmpty()
  balance: number;
}
