import { HttpStatus } from '@nestjs/common';
import AppError from 'src/core/errors/app.error';

class BadRequestError extends AppError {
  constructor(message: string, suberror: any[]) {
    super(message, HttpStatus.BAD_REQUEST, BadRequestError.name, suberror);
  }

  /**
   * Serialize Errors Bad Request
   * @returns { message: string; status: number; suberrors: any[] }[]
   */
  serializeErrors(): { message: string; status: number; suberrors: any[] }[] {
    return [
      { message: this.message, status: this.status, suberrors: this.suberror },
    ];
  }
}

export default BadRequestError;
