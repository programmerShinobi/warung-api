import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFileNotExcel', async: false })
export class FileNotExcelValidator implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File) {
    if (!/\.(xlsx|xls|xlsm|xlsb|xlt|csv|ods)$/i.test(file?.originalname))
      return true;
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be .xlsx|.xls|.xlsm|.xlsb|.xlt|.csv|.ods file`;
  }
}
