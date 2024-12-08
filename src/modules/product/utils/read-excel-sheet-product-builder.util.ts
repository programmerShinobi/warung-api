import {
  HeaderDto,
  ProductSheetsDto,
} from 'src/modules/product/dtos/product-sheet.dto';
import { camelCase } from 'lodash';
import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/core/base.service';
import { StringNumberBigintObjectType } from 'src/core/types/string-number-bigint-object.type';

@Injectable()
export class ReadExcelSheetProductBuilder extends BaseService {
  private sheet: ProductSheetsDto;

  getSheetName(name: string): this {
    this.sheet = new ProductSheetsDto();
    this.sheet.name = name;
    return this;
  }

  ignoreHeaderRow(rows = 1): this {
    const header = new HeaderDto();
    header.rows = rows;
    this.sheet.header = header;
    return this;
  }

  setSheetNameToJsonFields(columns: string[]): this {
    const columnToKey: Record<string, string> = {};
    columns.forEach((col, index): void => {
      columnToKey[String.fromCharCode(65 + index)] = camelCase(col);
    });

    this.sheet.columnToKey = columnToKey;
    return this;
  }

  setColumnPropertyToJsonFields(columns: {
    [key: string]: {
      dataType: StringNumberBigintObjectType;
      maxLength?: number;
    };
  }): this {
    this.sheet.columns = columns;
    return this;
  }

  build(): ProductSheetsDto {
    return this.sheet;
  }
}
