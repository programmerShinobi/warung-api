/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseService } from 'src/core/base.service';
import { Request } from 'express';
import { catchError, lastValueFrom, mergeMap, of, throwError } from 'rxjs';
import { ReadExcelSheetProductBuilder } from '../utils/read-excel-sheet-product-builder.util';
import { ProductProcessExcelToJsonBuilder } from '../utils/product-process-excel-to-json-builder.util';
import { MessagesInvalidDataError } from 'src/core/errors/invalid-data.error';
import { SheetNameEnum } from 'src/core/enums/sheet-name.enum';
import { ItemsProductDto } from '../dtos/items-product.dto';
import { ProductSheetsDto } from '../dtos/product-sheet.dto';
import { ReadProductSheetDto } from '../dtos/read-product-sheet.dto';
import { ExcelProductServiceInterface } from '../interfaces/excel-product.interface';

@Injectable()
export class ExcelProductService
  extends BaseService
  implements ExcelProductServiceInterface
{
  constructor(
    private readonly readExcelSheetBuilder: ReadExcelSheetProductBuilder,
    private readonly processExcelToJsonBuilder: ProductProcessExcelToJsonBuilder,
  ) {
    super(ExcelProductService?.name);
  }

  /**
   * Read Format Excel
   * @param req Request
   * @returns Promise<ReadProductSheetDto>
   */
  async readFormatExcel(req: Request): Promise<ReadProductSheetDto> {
    try {
      const productSheet: ProductSheetsDto = this.readExcelSheetBuilder
        .getSheetName(SheetNameEnum.PRODUCTS)
        .ignoreHeaderRow()
        .setSheetNameToJsonFields(ItemsProductDto.propertyNames)
        .setColumnPropertyToJsonFields(ItemsProductDto.propertyConfig)
        .build();

      const filePath: string = req?.file?.path
        ? String(req?.file?.path)
        : undefined;

      const data = of(filePath).pipe(
        catchError((error) => {
          return throwError(() => {
            this.logger.error(error);
            throw new BadRequestException(error);
          });
        }),
        mergeMap(() =>
          this.processExcelToJsonBuilder
            .getFile(filePath)
            .addSheet(productSheet)
            .build(),
        ),
      );

      const result = await lastValueFrom(data);

      this.logger.verbose({ result });
      return result;
    } catch (error) {
      if (error instanceof MessagesInvalidDataError) {
        const errorResponse = {
          status: 400,
          message: error?.errors,
          error: 'Bad Request',
        };
        this.logger.error({ errorResponse });
        throw new BadRequestException(errorResponse);
      } else {
        this.logger.error(error);
        throw new BadRequestException(error);
      }
    }
  }
}
