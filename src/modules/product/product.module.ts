import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/product.entity';
import { ProductController } from './product.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ProductService } from './services/product.service';
import { ExcelProductService } from './services/excel-product.service';
import { ProductProcessExcelToJsonBuilder } from './utils/product-process-excel-to-json-builder.util';
import { ReadExcelSheetProductBuilder } from './utils/read-excel-sheet-product-builder.util';

@Module({
  imports: [TypeOrmModule.forFeature([Products]), AuditLogModule],
  providers: [
    ProductService,
    ExcelProductService,
    ProductProcessExcelToJsonBuilder,
    ReadExcelSheetProductBuilder,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
