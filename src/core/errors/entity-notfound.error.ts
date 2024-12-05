import AppError from './app.error';

class EntityNotFoundError extends AppError {
  constructor(message: string, suberror?: any) {
    super(message, 404, EntityNotFoundError.name, suberror);
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }

  /**
   * Serialize Errors Engity Not Found
   * @returns { message: string; status: number; suberrors: any[] }[]
   */
  serializeErrors(): { message: string; status: number; suberrors: any[] }[] {
    return [
      { message: this.message, status: this.status, suberrors: this.suberror },
    ];
  }
}

export default EntityNotFoundError;
