import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import TypeOrmConfig from '../../config/typeorm.config';

@Injectable()
export class TypeOrmConfigFactory implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return TypeOrmConfig.options;
  }
}
