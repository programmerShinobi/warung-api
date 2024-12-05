import { ValidationOptions, registerDecorator } from 'class-validator';
import { FileNotMoreThenSize10MbValidator } from '../validators/file-not-more-then-size-10mb.validator';

export function IsFileNotMoreThenSize10Mb<T>(
  validationOptions?: ValidationOptions,
) {
  return function (object: T, propertyName: string) {
    registerDecorator({
      name: 'isFileNotMoreThenSize10Mb',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: FileNotMoreThenSize10MbValidator,
    });
  };
}
