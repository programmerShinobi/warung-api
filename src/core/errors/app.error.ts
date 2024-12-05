import { Logger } from '@nestjs/common';

abstract class AppError extends Error {
  suberror: any;
  message: string;
  status: number;
  logger: Logger;

  constructor(
    message: string,
    status?: number,
    instance?: string,
    suberror?: any,
  ) {
    super(message);
    this.message = message;
    this.status = status;
    this.suberror = suberror;
    this.logger = new Logger(instance ?? AppError.name);
    this.logger.error(message);
    if (process.env.NODE_ENV === 'dev') {
      this.logger.debug(message, suberror);
    }
  }

  /**
   * Get Non Undefined Instance
   * @param _instance any
   * @param _default any
   * @returns any
   */
  getNonUndefinedInstance(_instance, _default) {
    if (_instance === undefined) {
      return _default;
    }
    return _instance;
  }

  /**
   * Serialize Errors APP
   * @returns :
    | { message: string; status: number; suberrors: any[] }[]
    | null;
   */
  abstract serializeErrors():
    | { message: string; status: number; suberrors: any[] }[]
    | null;
}

export default AppError;
