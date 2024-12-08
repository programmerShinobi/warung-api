import { Type } from 'class-transformer';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  categoryId: number;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  categoryName: string;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  sku: string;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  name: string;

  @IsString()
  @Type(() => String)
  description: string;

  @IsNumber()
  @Type(() => Number)
  weight: number;

  @IsNumber()
  @Type(() => Number)
  width: number;

  @IsNumber()
  @Type(() => Number)
  length: number;

  @IsNumber()
  @Type(() => Number)
  height: number;

  @IsString()
  @Type(() => String)
  image: string;

  @IsNumber()
  @Type(() => Number)
  harga: number;
}
