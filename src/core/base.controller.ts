import { HttpStatus, Logger } from '@nestjs/common';
import BadRequestError from 'src/core/errors/bad-request.errors';
import { DateConfig } from 'src/config/date.config';
import { Response } from 'express';
import { ResponseDto } from './dtos/response.dto';

abstract class BaseController {
  public logger: Logger;

  constructor(instance: string) {
    this.logger = new Logger(instance);
  }

  debug(message: string, context: any) {
    if (process.env.NODE_ENV === 'dev') {
      this.logger.debug(message, context);
    }
  }

  /**
   * Modify Message
   * @param message string | object
   * @returns string | object
   */
  modifyMessage(message: string | object): string | object {
    if (typeof message !== 'string') return message;

    const modifiedMessage = message
      .replace(/\[.*?\btable\b\]/g, '[table]')
      .replace(/\[.*?\bindex\b\]/g, '[index]')
      .replace(/\[.*?\bview\b\]/g, '[view]')
      .replace(
        /\[.*?\bmaterialized view \(table\)\]/g,
        '[materialized view (table)]',
      );

    if (modifiedMessage !== message && process.env.NODE_ENV === 'prod')
      return modifiedMessage;

    return message;
  }

  responseAccepted<T>(
    res: Response,
    data: T,
    meta?: object,
    message?: string,
  ): Response;
  responseAccepted<T, U>(
    res: Response,
    data: T,
    meta: U,
    message?: string,
  ): Response;
  responseAccepted(
    res: Response,
    data: any,
    meta: any,
    message?: string,
  ): Response {
    return res
      .status(HttpStatus.ACCEPTED)
      .send(
        ResponseDto.result(
          data,
          meta === undefined ? { status: 'OK' } : meta,
          message === undefined ? 'Data has been found.' : message,
        ),
      );
  }

  responseOk<T>(
    res: Response,
    data: T,
    meta?: object,
    message?: string,
  ): Response;
  responseOk<T, U>(res: Response, data: T, meta: U, message?: string): Response;
  responseOk(res: Response, data: any, meta: any, message?: string): Response {
    return res
      .status(HttpStatus.OK)
      .send(
        ResponseDto.result(
          data,
          meta === undefined ? { status: 'OK' } : meta,
          message === undefined ? 'Data has been found.' : message,
        ),
      );
  }

  responseCreated<T>(
    res: Response,
    data: T,
    meta?: object,
    message?: string,
  ): Response;
  responseCreated<T, U>(
    res: Response,
    data: T,
    meta: U,
    message?: string,
  ): Response;
  responseCreated(
    res: Response,
    data: any,
    meta: any,
    message: string,
  ): Response {
    return res
      .status(HttpStatus.CREATED)
      .send(
        ResponseDto.result(
          data,
          meta === undefined ? { status: 'OK' } : meta,
          message === undefined ? 'Data has been created.' : message,
        ),
      );
  }

  responseNoContent(res: Response) {
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  private getNestedApplicationRef(obj: any) {
    while (obj?.applicationRef) {
      obj = obj.applicationRef;
    }
    return obj;
  }

  responseError(res: Response, error: any) {
    const errorResponse = error?.response;
    const errorResponseWithApplicationRef = this.getNestedApplicationRef(error);

    const response = errorResponse
      ? {
          message:
            this.modifyMessage(errorResponse?.message) ||
            this.modifyMessage(error?.message),
          error: errorResponse?.error,
          statusCode: errorResponse?.statusCode || error?.status,
          time: new DateConfig().get(),
        }
      : errorResponseWithApplicationRef
        ? {
            message:
              this.modifyMessage(
                errorResponseWithApplicationRef?.response?.message,
              ) || this.modifyMessage(errorResponseWithApplicationRef?.message),
            error: errorResponseWithApplicationRef?.response?.error,
            details: errorResponseWithApplicationRef?.response?.suberror,
            statusCode:
              errorResponseWithApplicationRef?.response?.statusCode ||
              errorResponseWithApplicationRef?.status,
            time: new DateConfig().get(),
          }
        : error?.status
          ? {
              message: this.modifyMessage(error?.message),
              details: error?.suberror,
              statusCode: error?.status,
              time: new DateConfig().get(),
            }
          : {
              error,
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              message: 'Internal server error',
              time: new DateConfig().get(),
            };

    return res
      .status(
        response?.statusCode ||
          error?.status ||
          HttpStatus.INTERNAL_SERVER_ERROR,
      )
      .json(response);
  }

  checkPresent<T>(object: T) {
    if (object === null || object === undefined) {
      throw new BadRequestError('Some requirements not found', [object]);
    }
  }
}

export default BaseController;
