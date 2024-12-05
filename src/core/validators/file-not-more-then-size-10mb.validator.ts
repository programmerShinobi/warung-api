import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFileNotMoreThenSize10Mb', async: false })
export class FileNotMoreThenSize10MbValidator
  implements ValidatorConstraintInterface
{
  validate(file: Express.Multer.File): boolean {
    if (file?.size > 10000000) return false;
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be under 10MB in size`;
  }
}
