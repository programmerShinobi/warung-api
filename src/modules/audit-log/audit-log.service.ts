import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Repository } from 'typeorm';
import { BaseService } from 'src/core/base.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { catchError, from, lastValueFrom, of, switchMap } from 'rxjs';
import { AuditLogServiceInterface } from './interfaces/audit-log.service.interface';

@Injectable()
export class AuditLogService
  extends BaseService
  implements AuditLogServiceInterface
{
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {
    super(AuditLogService.name);
  }

  /**
   * Mencatat aktivitas CRUD ke dalam tabel audit_log.
   * @param entity - Nama entitas
   * @param operation - Jenis operasi (CREATE, UPDATE, DELETE)
   * @param changes - Perubahan data
   */
  async createAuditLog(
    entity: string,
    operation: string,
    changes: string,
  ): Promise<void> {
    try {
      const $data = of(
        this.auditLogRepository.create({
          entity,
          operation,
          changes,
        }),
      ).pipe(
        catchError((error) => {
          throw new ExceptionsHandler(error);
        }),
        switchMap((auditLog) =>
          from(this.auditLogRepository.save(auditLog)).pipe(
            catchError((error) => {
              throw new ExceptionsHandler(error);
            }),
          ),
        ),
      );
      await lastValueFrom($data);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
