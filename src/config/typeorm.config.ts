import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

dotenv.config();

/**
 * Konfigurasi TypeORM menggunakan environment variables.
 */
export const configs: PostgresConnectionOptions = {
  type: 'postgres',
  url: String(process.env.DATABASE_URL),
  entities: [__dirname + '/../modules/entities/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/../modules/database/migrations/*.{ts,js}'],
  dropSchema: false,
  synchronize: false, // Set ke false karena kita menggunakan migrasi
  logging: true, // Aktifkan log untuk debugging
};

const dataSource = new DataSource(configs);

export default dataSource;
