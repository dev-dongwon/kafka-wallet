import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWalletsDto {
  @IsNumber()
  @IsNotEmpty()
  balance: number;
}
