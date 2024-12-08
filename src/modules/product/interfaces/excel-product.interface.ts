import { Request } from 'express';
import { ReadProductSheetDto } from '../dtos/read-product-sheet.dto';

export interface ExcelProductServiceInterface {
  /**
   * Read Format Excel
   * @param req Request
   * @returns Promise<ReadProductSheetDto>
   */
  readFormatExcel(req: Request): Promise<ReadProductSheetDto>;
}
