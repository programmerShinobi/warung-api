import { toZonedTime } from 'date-fns-tz';

export class DateConfig {
  get(): Date {
    return toZonedTime(new Date(), 'Asia/Jakarta');
  }
}
