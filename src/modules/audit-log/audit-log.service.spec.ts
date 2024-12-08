/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogs } from './entities/audit-log.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { of, throwError } from 'rxjs';
import { TableNameEnum } from 'src/core/enums/table-name.enum';
import { OperatorNameEnum } from 'src/core/enums/operator-name.enum';

describe(AuditLogService.name, () => {
  let service: AuditLogService;
  let repository: Repository<AuditLogs>;

  // Mock the audit log repository
  const mockAuditLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: getRepositoryToken(AuditLogs),
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    repository = module.get<Repository<AuditLogs>>(
      getRepositoryToken(AuditLogs),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAuditLog', () => {
    it('should successfully create an audit log', async () => {
      const entity = TableNameEnum.PRODUCTS;
      const operation = OperatorNameEnum.CREATE;
      const changes = `{
      "id": 86,
      "CategoryId": 14,
      "categoryName": "Cemilan",
      "sku": "MHZVTK",
      "name": "Ciki ciki",
      "description": "Ciki ciki yang super enak, hanya di toko klontong kami",
      "weight": 500,
      "width": 5,
      "length": 5,
      "height": 5,
      "image": "https://cf.shopee.co.id/file/7cb930d1bd183a435f4fb3e5cc4a896b",
      "harga": 30000
      }`;

      const mockAuditLog = { entity, operation, changes };

      // Mocking repository create and save methods
      mockAuditLogRepository.create.mockReturnValue(mockAuditLog);
      mockAuditLogRepository.save.mockReturnValue(of(mockAuditLog));

      // Call the service method
      await service.createAuditLog(entity, operation, changes);

      // Ensure the create and save methods were called
      expect(mockAuditLogRepository.create).toHaveBeenCalledWith({
        entity,
        operation,
        changes,
      });
      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(mockAuditLog);
    });

    it('should throw an exception if save fails', async () => {
      const entity = TableNameEnum.PRODUCTS;
      const operation = OperatorNameEnum.CREATE;
      const changes = `{
      "id": 86,
      "CategoryId": 14,
      "categoryName": "Cemilan",
      "sku": "MHZVTK",
      "name": "Ciki ciki",
      "description": "Ciki ciki yang super enak, hanya di toko klontong kami",
      "weight": 500,
      "width": 5,
      "length": 5,
      "height": 5,
      "image": "https://cf.shopee.co.id/file/7cb930d1bd183a435f4fb3e5cc4a896b",
      "harga": 30000
      }`;

      // Mocking repository create method
      mockAuditLogRepository.create.mockReturnValue({
        entity,
        operation,
        changes,
      });
      mockAuditLogRepository.save.mockReturnValue(
        throwError(() => new Error('Database error')),
      );

      // Call the service method and check if an error is thrown
      try {
        await service.createAuditLog(entity, operation, changes);
      } catch (error) {
        expect(error).toBeInstanceOf(ExceptionsHandler);
        expect(error.message).toContain('Database error');
      }
    });

    it('should handle error when creating audit log', async () => {
      const entity = TableNameEnum.PRODUCTS;
      const operation = OperatorNameEnum.CREATE;
      const changes = `{
      "id": 86,
      "CategoryId": 14,
      "categoryName": "Cemilan",
      "sku": "MHZVTK",
      "name": "Ciki ciki",
      "description": "Ciki ciki yang super enak, hanya di toko klontong kami",
      "weight": 500,
      "width": 5,
      "length": 5,
      "height": 5,
      "image": "https://cf.shopee.co.id/file/7cb930d1bd183a435f4fb3e5cc4a896b",
      "harga": 30000
      }`;

      // Mocking repository create method to throw an error
      mockAuditLogRepository.create.mockImplementation(() => {
        throw new Error('Create failed');
      });

      try {
        await service.createAuditLog(entity, operation, changes);
      } catch (error) {
        expect(error.message).toBe('Create failed');
      }
    });
  });
});
