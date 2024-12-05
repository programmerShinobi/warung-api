import { DateConfig } from 'src/config/date.config';

/**
 * @property data
 * @property meta
 * @property time
 * @property message
 * @static result
 */
export class ResponseDto {
  data: any;
  meta: object;
  time: Date;
  message: string;

  /**
   * Result of ResponseDto
   * @param _data T
   * @param _meta object
   * @param _message string
   * @returns ResponseDto
   */
  static result<T>(_data: T, _meta: object, _message: string): ResponseDto;

  /**
   * Result of ResponseDto
   * @param _data any
   * @param _meta any
   * @param _message string
   * @returns ResponseDto
   */
  static result(_data: any, _meta: any, _message: string): ResponseDto {
    const result = new ResponseDto();
    result.data = _data;
    result.meta = _meta;
    result.message = _message;
    result.time = new DateConfig().get();
    return result;
  }
}
