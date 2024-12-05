import { Logger } from '@nestjs/common';
import AppError from './errors/app.error';
import EntityNotFoundError from './errors/entity-notfound.error';
import ServiceError from './errors/service.error';

export abstract class BaseService {
  public logger: Logger;
  private readonly instanceName: string;

  constructor(instance: string) {
    this.logger = new Logger(instance);
    this.instanceName = instance;
  }

  /**
   * Handle Empty Check
   * @param data T
   */
  handleEmptyCheck<T>(data: T) {
    if (data instanceof Array) {
      if (data.length === 0) {
        throw new EntityNotFoundError(
          `No data returned ${this.instanceName}`,
          data,
        );
      }
    }

    if (data === null) {
      throw new EntityNotFoundError(
        `No data returned or null ${this.instanceName}`,
        data,
      );
    }
  }

  /**
   * Handle Service Error
   * @param error AppError
   */
  handleServiceError(error: AppError) {
    if (error instanceof ServiceError) {
      throw new ServiceError(error?.message);
    }

    if (error instanceof EntityNotFoundError) {
      throw new EntityNotFoundError(error?.message);
    }

    this.logger.error(error);
  }
}
