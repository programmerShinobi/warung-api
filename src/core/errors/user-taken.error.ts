import { HttpStatus } from '@nestjs/common';
import AppError from 'src/core/errors/app.error';

class UserTakenError extends AppError {
  constructor(message: string, suberror: any[]) {
    super(message, HttpStatus.BAD_REQUEST, UserTakenError.name, suberror);
  }

  /**
   * Serialize Errors User Taken
   * @returns { message: string; status: number; suberrors: any[] }[]
   */
  serializeErrors(): { message: string; status: number; suberrors: any[] }[] {
    return [
      { message: this.message, status: this.status, suberrors: this.suberror },
    ];
  }
}

export default UserTakenError;
