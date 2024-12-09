import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ItemsCheckoutDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  total: number;
}
