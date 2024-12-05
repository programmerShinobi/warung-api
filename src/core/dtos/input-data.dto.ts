import { IsFileNotEmpty } from '../decorators/is-file-not-empty.decorator';
import { IsFileNotExcel } from '../decorators/is-file-not-excel.decorator';
import { IsFileNotMoreThenSize10Mb } from '../decorators/is-file-not-more-then-size.decorator';

/**
 * @property customerName
 * @property configName
 * @property file
 */
export class InputDataDto {
  @IsFileNotEmpty()
  @IsFileNotExcel()
  @IsFileNotMoreThenSize10Mb()
  file: Express.Multer.File;
}
