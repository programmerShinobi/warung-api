import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './modules/product/entities/product.entity';
import { ProductModule } from './modules/product/product.module';
import { AuditLog } from './modules/audit-log/entities/audit-log.entity';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { Checkout } from './modules/checkout/entities/checkout.entity';
import { CheckoutModule } from './modules/checkout/checkout.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [Product, AuditLog, Checkout],
        synchronize: true,
      }),
    }),
    ProductModule,
    AuditLogModule,
    CheckoutModule,
  ],
})
export class AppModule {}
