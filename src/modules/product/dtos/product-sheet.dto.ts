import { IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StringNumberBigintObjectType } from '../../../core/types/string-number-bigint-object.type';

/**
 * @property name
 * @property header
 * @property columnToKey
 * @property columns
 */
export class ProductSheetsDto {
  @IsString()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => HeaderDto)
  header: {
    rows: number;
  };

  @IsObject()
  columnToKey: { [key: string]: string };

  @IsObject()
  @ValidateNested()
  @Type(() => ColumnDto)
  columns: { [key: string]: ColumnDto };
}

/**
 * @property rows
 */
export class HeaderDto {
  @IsNumber()
  rows: number;
}

/**
 * @property dataType
 * @property maxLength
 */
export class ColumnDto {
  dataType: StringNumberBigintObjectType;
  maxLength?: number;
}
