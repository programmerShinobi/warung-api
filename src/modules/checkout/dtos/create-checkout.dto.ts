import { Type } from 'class-transformer';
import { IsNumber, IsNotEmpty, ValidateNested } from 'class-validator';
import { ItemsCheckoutDto } from './items-checkout.dto';

export class CreateCheckoutDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  userId: number;

  @ValidateNested({ each: true })
  @Type(() => ItemsCheckoutDto)
  items: ItemsCheckoutDto[];
}
