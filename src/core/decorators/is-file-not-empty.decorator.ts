import { ValidationOptions, registerDecorator } from 'class-validator';
import { FileNotEmptyValidator } from '../validators/file-not-empty.validator';

export function IsFileNotEmpty<T>(validationOptions?: ValidationOptions) {
  return function (object: T, propertyName: string) {
    registerDecorator({
      name: 'isFileNotEmpty',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: FileNotEmptyValidator,
    });
  };
}
