import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogService } from './audit-log.service';
import { AuditLogs } from './entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogs])],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
