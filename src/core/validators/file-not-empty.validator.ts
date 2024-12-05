import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFileNotEmpty', async: false })
export class FileNotEmptyValidator implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File) {
    if (file !== null && file === undefined) return true;
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} should not be empty`;
  }
}
