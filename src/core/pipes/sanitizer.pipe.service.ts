/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class SanitizePipe implements PipeTransform {
  private readonly allowedCharsRegex = /[^\w\s./|:-]/gi;

  /**
   * Checks for disallowed characters in a string.
   * @param value The value to check.
   * @returns True if disallowed characters are found; otherwise, false.
   */
  private hasDisallowedChars(value: string): boolean {
    return this.allowedCharsRegex.test(value);
  }

  /**
   * Sanitizes a given string by trimming it and removing unwanted characters.
   * @param value The value to sanitize.
   * @returns The sanitized string.
   */
  private sanitizeString(value: string): string {
    return value.trim().replace(this.allowedCharsRegex, '');
  }

  /**
   * Transforms the value based on its type.
   * @param value The value to transform.
   * @param metadata Metadata of the argument.
   * @returns The transformed value.
   */
  transform(value: any, metadata: ArgumentMetadata): any {
    if (typeof value === 'string') {
      if (this.hasDisallowedChars(value)) {
        throw new BadRequestException(
          `The input contains disallowed characters: "${value
            .match(this.allowedCharsRegex)
            ?.join(', ')}"`,
        );
      }
      return this.sanitizeString(value);
    }

    if (Array.isArray(value)) {
      return this.sanitizeArray(value);
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }

    return value;
  }

  /**
   * Sanitizes each item in an array of strings.
   * @param value The array of values to sanitize.
   * @returns The sanitized array.
   */
  private sanitizeArray(value: any[]): any[] {
    return value.map((item) => {
      if (typeof item === 'string' && this.hasDisallowedChars(item)) {
        throw new BadRequestException(
          `The array contains disallowed characters in item: "${item
            .match(this.allowedCharsRegex)
            ?.join(', ')}"`,
        );
      }
      return typeof item === 'string' ? this.sanitizeString(item) : item;
    });
  }

  /**
   * Sanitizes the properties of an object.
   * @param value The object whose properties need sanitizing.
   * @returns The sanitized object.
   */
  private sanitizeObject(value: Record<string, any>): Record<string, any> {
    for (const key in value) {
      if (typeof value[key] === 'string') {
        if (this.hasDisallowedChars(value[key])) {
          throw new BadRequestException(
            `The property "${key}" contains disallowed characters: "${value[key]
              .match(this.allowedCharsRegex)
              ?.join(', ')}"`,
          );
        }
        value[key] = this.sanitizeString(value[key]);
      }
    }
    return value;
  }
}
