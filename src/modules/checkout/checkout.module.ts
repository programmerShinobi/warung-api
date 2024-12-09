import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checkout } from './entities/checkout.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Checkout]),
    AuditLogModule,
    ProductModule,
  ],
  providers: [CheckoutService],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
