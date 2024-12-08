import { Cell, CellValue, Row, Workbook, Worksheet } from 'exceljs';
import { MessagesInvalidDataError } from '../../../core/errors/invalid-data.error';
import { BaseService } from '../../../core/base.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Observable,
  catchError,
  concatMap,
  from,
  lastValueFrom,
  of,
} from 'rxjs';
import {
  ColumnDto,
  ProductSheetsDto,
} from 'src/modules/product/dtos/product-sheet.dto';
import { ReadProductSheetDto } from 'src/modules/product/dtos/read-product-sheet.dto';

@Injectable()
export class ProductProcessExcelToJsonBuilder extends BaseService {
  private filePath: string;
  private sheets: ProductSheetsDto[];
  private errorSheetName: string[] = [];
  private errorMessages: { [key: string]: string }[] = [];

  constructor() {
    super(ProductProcessExcelToJsonBuilder?.name);
  }

  /**
   * Get File
   * @param filePath string
   * @returns this
   */
  getFile(filePath: string): this {
    this.filePath = filePath;
    this.sheets = [];
    this.errorSheetName = [];
    this.errorMessages = [];
    return this;
  }

  /**
   * Add Sheet
   * @param sheet ProductSheetsDto
   * @returns this
   */
  addSheet(sheet: ProductSheetsDto): this {
    this.sheets.push(sheet);
    return this;
  }

  /**
   * Validate Cell Data
   * @param cellValue CellValue
   * @param dataType string
   * @param maxLength number
   * @returns boolean
   */
  private static validateCellData(
    cellValue: CellValue,
    dataType: string,
    maxLength?: number,
  ): boolean {
    if (dataType === 'string' && typeof cellValue !== 'string') return false;
    if (
      dataType === 'number' &&
      (typeof cellValue !== 'number' || isNaN(cellValue))
    )
      return false;
    if (maxLength && cellValue.toLocaleString().length > maxLength)
      return false;
    return true;
  }

  /**
   * Transform Text
   * @param data string
   * @returns string
   */
  private transformText(data: string): string {
    let result = '';
    let isPrevCharUpperCase = false;

    for (const element of data) {
      const char = element;
      const isCharUpperCase = char === char.toUpperCase();

      if (isCharUpperCase && !isPrevCharUpperCase) {
        if (result !== '') {
          result += ' '; // Add space for separation
        }
        result += char;
      } else if (!isCharUpperCase && isPrevCharUpperCase) {
        result += char.toUpperCase(); // Convert to uppercase
      } else {
        result += char.toUpperCase();
      }

      isPrevCharUpperCase = isCharUpperCase;
    }

    return result;
  }

  /**
   * processCell
   * @param cell Cell
   * @param cellIndex number
   * @param rowData Record<string, CellValue>
   * @param sheetConfig ProductSheetsDto
   * @returns this
   */
  private processCell(
    cell: Cell,
    cellIndex: number,
    rowData: Record<string, CellValue>,
    sheetConfig: ProductSheetsDto,
  ): this {
    const columnName: string =
      sheetConfig.columnToKey[String.fromCharCode(64 + cellIndex)];
    if (!columnName) return;

    const columnConfig: ColumnDto = sheetConfig.columns[columnName];
    if (!columnConfig) return;

    const { dataType, maxLength }: ColumnDto = columnConfig;
    const cellValue: CellValue = cell?.value['result']?.['richText']
      ? cell?.value['result']?.['richText']
          .map((entry) => entry.text)
          .join('\n')
      : cell?.value['result'] || cell?.value['error']?.['richText']
        ? cell?.value['error']?.['richText']
            .map((entry) => entry.text)
            .join('\n')
        : cell?.value['error'] || cell?.value?.['richText']
          ? cell?.value?.['richText'].map((entry) => entry.text).join('\n')
          : cell?.value['text']
            ? cell?.value['text']
            : cell?.value['hyperlink']
              ? cell?.value['hyperlink']
              : cell?.value;

    // this.logger.verbose(`column-name : ${columnName}`);
    // this.logger.verbose(`value : ${cellValue}`);
    // this.logger.verbose(`type: ${typeof cellValue}`);
    // this.logger.verbose('______________________________ ');

    const transformText = this.transformText(columnName);

    if (Object(cellValue).toString().startsWith('Invalid')) {
      this.errorSheetName.push(sheetConfig.name);
      this.errorMessages.push({
        [`column[${String.fromCharCode(64 + cellIndex)}]`]: `${transformText} cell format categories must be general* on row ${cell.row}`,
      });
      return this;
    }

    if (
      !ProductProcessExcelToJsonBuilder.validateCellData(
        cellValue,
        dataType,
        maxLength,
      )
    ) {
      this.errorSheetName.push(sheetConfig.name);
      this.errorMessages.push({
        [`column[${String.fromCharCode(64 + cellIndex)}]`]: `${transformText} must be of type ${
          dataType === 'Object' ? 'string' : dataType
        }* or length limit is ${maxLength}* on row ${cell.row}`,
      });
      return this;
    }

    rowData[columnName] = cellValue;
    return this;
  }

  /**
   * 
   * @param worksheet Worksheet
   * @param headerRows number
   * @param sheetConfig ProductSheetsDto
   * @param processCellFn (
      cell: Cell,
      cellIndex: number,
      rowData: Record<string, CellValue>,
      sheetConfig: ProductSheetsDto,
    ) => this
   * @returns T[]
   */
  private readSheetData<T>(
    worksheet: Worksheet,
    headerRows: number,
    sheetConfig: ProductSheetsDto,
    processCellFn: (
      cell: Cell,
      cellIndex: number,
      rowData: Record<string, CellValue>,
      sheetConfig: ProductSheetsDto,
    ) => this,
  ): T[] {
    const rows: T[] = [];

    worksheet.eachRow((row: Row, rowIndex: number): void => {
      if (rowIndex > headerRows) {
        const rowData: Record<string, CellValue> = {};
        row.eachCell((cell: Cell, cellIndex: number): void => {
          processCellFn(cell, cellIndex, rowData, sheetConfig);
        });
        if (!rowData?.name) {
          this.errorSheetName.push(sheetConfig.name);
          this.errorMessages.push({
            [`column[${String.fromCharCode(64 + headerRows)}]`]: `Name should not be empty* on row ${rowIndex}`,
          });
        }
        rows.push(rowData as T);
      }
    });

    return rows;
  }

  /**
   * Text To CamelCase
   * @param text string
   * @returns string
   */
  private textToCamelCase(text: string): string {
    const words: string[] = text.split(' ');
    const camelCaseWords: string[] = [words[0].toLowerCase()];

    for (let i = 1; i < words.length; i++) {
      camelCaseWords.push(
        words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase(),
      );
    }

    return camelCaseWords.join('');
  }

  /**
   * Builder : Product Process Excel To JSON
   * @returns Promise<ReadProductSheetDto>
   */
  async build(): Promise<ReadProductSheetDto> {
    const workbook: Workbook = new Workbook();
    await workbook.xlsx.readFile(this.filePath);

    const data: ReadProductSheetDto = {
      products: null,
    };

    if (this.sheets.length === 0)
      throw new NotFoundException(`Sheet data not found.`);

    const $dataSheets: Observable<ProductSheetsDto> = from(this.sheets).pipe(
      catchError(() => of(null)),
      concatMap((sheet) => {
        const { name, header } = sheet;
        const worksheet: Worksheet = workbook.getWorksheet(name);
        if (worksheet) {
          const rows = this.readSheetData(
            worksheet,
            header.rows,
            sheet,
            this.processCell.bind(this),
          );
          data[this.textToCamelCase(name)] = rows;
        }
        return of(sheet);
      }),
    );
    await lastValueFrom($dataSheets);

    if (this.errorSheetName.length > 0 && this.errorMessages.length > 0) {
      const uniqueSheetNames: string[] = [...new Set(this.errorSheetName)];
      const errors = uniqueSheetNames.map((sheetName) => {
        const sheetErrorMessages: { [key: string]: string }[] =
          this.errorMessages
            .map((msg, index) =>
              this.errorSheetName[index] === sheetName ? msg : null,
            )
            .filter(Boolean);
        return { sheetName, invalidColumn: sheetErrorMessages };
      });

      throw new MessagesInvalidDataError(errors);
    }

    return data;
  }
}
