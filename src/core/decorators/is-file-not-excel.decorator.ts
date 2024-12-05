import { ValidationOptions, registerDecorator } from 'class-validator';
import { FileNotExcelValidator } from '../validators/file-not-excel.validator';

export function IsFileNotExcel<T>(validationOptions?: ValidationOptions) {
  return function (object: T, propertyName: string) {
    registerDecorator({
      name: 'isFileNotExcel',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: FileNotExcelValidator,
    });
  };
}
