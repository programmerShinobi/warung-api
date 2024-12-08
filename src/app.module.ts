import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './modules/product/entities/product.entity';
import { ProductModule } from './modules/product/product.module';
import { AuditLogs } from './modules/audit-log/entities/audit-log.entity';
import { AuditLogModule } from './modules/audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [Products, AuditLogs],
        synchronize: true,
      }),
    }),
    ProductModule,
    AuditLogModule,
  ],
})
export class AppModule {}
