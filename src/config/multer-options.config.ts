/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { format } from 'date-fns-tz';
import { DateConfig } from './date.config';

// Konfigurasi multer
export const multerConfig = {
  dest: process.env.UPLOAD_LOCATION,
};

// Regex karakter yang diizinkan
const allowedCharsRegex = /^[\w\s./|:-]+$/;

// Berfungsi untuk mengekstrak karakter unik yang dilarang
const findDisallowedChars = (input: string): string => {
  return [...new Set(input.replace(/[\w\s./|:-]/g, ''))].join('');
};

// Opsi pengunggahan multer
export const multerOptions = {
  // Mengaktifkan batas ukuran file
  limits: {
    fileSize: +process.env.MAX_FILE_SIZE,
  },
  // Periksa mimetype untuk mengizinkan pengunggahan
  fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Memungkinkan penyimpanan file
    if (/\.(xlsx|xls|xlsm|xlsb|xlt|csv|ods)$/i.test(file?.originalname))
      cb(null, true);
    // Menolak file
    else
      cb(
        new BadRequestException(
          `Unsupported file type ${extname(file.originalname)}`,
        ),
        false,
      );
  },
  // Properti penyimpanan
  storage: diskStorage({
    // Rincian jalur penyimpanan tujuan
    destination: (req: Request, file: Express.Multer.File, cb: Function) => {
      const uploadPath = multerConfig.dest;
      // Buat folder jika tidak ada
      if (!existsSync(uploadPath)) mkdirSync(uploadPath);

      cb(null, uploadPath);
    },
    // Detail modifikasi file
    filename: (req: Request, file: Express.Multer.File, cb: Function) => {
      const date: Date = req?.body?.date
        ? new Date(String(req?.body?.date))
        : new DateConfig().get();

      const creationDateFormatted: string = format(date, 'yyyy-MM-dd');
      const actualHours = date.getUTCHours();
      const actualMinutes = date.getUTCMinutes();
      const actualSeconds = date.getUTCSeconds();
      const actualMilliseconds = date.getUTCMilliseconds();

      const customerName = req?.body?.customerName
        ? String(req?.body?.customerName)
        : undefined;

      const configName = req?.body?.configName
        ? String(req?.body?.configName)
        : undefined;

      // Validation customerName & configName
      const errors = [];
      if (!customerName) errors.push(`customerName should not be empty`);
      if (!configName) errors.push(`configName should not be empty`);

      // Check for disallowed characters
      if (customerName && !allowedCharsRegex.test(customerName)) {
        const disallowedChars = findDisallowedChars(customerName);
        errors.push(
          `customerName contains disallowed characters: ${disallowedChars}`,
        );
      }

      if (configName && !allowedCharsRegex.test(configName)) {
        const disallowedChars = findDisallowedChars(configName);
        errors.push(
          `configName contains disallowed characters: ${disallowedChars}`,
        );
      }

      if (errors.length > 0) {
        cb(new BadRequestException(errors), false);
        return;
      }

      const uploadedFileNameWithActualTime =
        customerName +
        '-' +
        configName +
        '-' +
        creationDateFormatted +
        '-T' +
        actualHours +
        ':' +
        actualMinutes +
        ':' +
        actualSeconds +
        ':' +
        actualMilliseconds +
        'Z' +
        extname(file.originalname);

      // Calling the callback passing the validated and sanitized name
      cb(null, uploadedFileNameWithActualTime);
    },
  }),
};
