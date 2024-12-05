import AppError from './app.error';

class TimeoutResponseError extends AppError {
  constructor(message: string, suberror?: any[]) {
    super(message, 408, TimeoutResponseError.name, suberror);
    Object.setPrototypeOf(this, TimeoutResponseError.prototype);
  }

  /**
   * Serialize Errors Timeout Response
   * @returns { message: string; status: number; suberrors: any[] }[]
   */
  serializeErrors(): { message: string; status: number; suberrors: any[] }[] {
    return [
      { message: this.message, status: this.status, suberrors: this.suberror },
    ];
  }
}

export default TimeoutResponseError;
