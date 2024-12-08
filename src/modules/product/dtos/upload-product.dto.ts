import { IsFileNotEmpty } from 'src/core/decorators/is-file-not-empty.decorator';
import { IsFileNotExcel } from 'src/core/decorators/is-file-not-excel.decorator';
import { IsFileNotMoreThenSize10Mb } from 'src/core/decorators/is-file-not-more-then-size.decorator';

/**
 * @property file
 */
export class UploadProductDto {
  @IsFileNotEmpty()
  @IsFileNotExcel()
  @IsFileNotMoreThenSize10Mb()
  file: Express.Multer.File;
}
