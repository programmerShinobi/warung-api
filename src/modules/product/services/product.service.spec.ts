/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { AuditLogService } from 'src/modules/audit-log/audit-log.service';
import { ExcelProductService } from './excel-product.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { CreateProductDto } from '../dtos/create-product.dto';

describe('ProductService', () => {
  let service: ProductService;
  let repository: Repository<Product>;
  let auditLogService: AuditLogService;
  let excelProductService: ExcelProductService;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
  };

  const mockAuditLogService = {
    createAuditLog: jest.fn(),
  };

  const mockExcelProductService = {
    readFormatExcel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
        {
          provide: ExcelProductService,
          useValue: mockExcelProductService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
    auditLogService = module.get<AuditLogService>(AuditLogService);
    excelProductService = module.get<ExcelProductService>(ExcelProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleFileUpload', () => {
    it('should successfully process file upload', async () => {
      const req: any = {}; // Mocking the request object
      const mockReadResult = {
        products: [
          { name: 'Product 1', categoryName: 'Category 1', harga: 100 },
          { name: 'Product 2', categoryName: 'Category 2', harga: 200 },
        ],
      };

      mockExcelProductService.readFormatExcel.mockReturnValue(
        of(mockReadResult),
      );

      const mockCreateProductResponse = {
        id: 1,
        ...mockReadResult.products[0],
      };
      mockProductRepository.create.mockReturnValue(mockCreateProductResponse);
      mockProductRepository.save.mockReturnValue(of(mockCreateProductResponse));

      const result = await service.handleFileUpload(req);

      expect(mockExcelProductService.readFormatExcel).toHaveBeenCalled();
      expect(mockProductRepository.create).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(result.length).toBe(2);
    });

    it('should throw BadRequestException if no products found in the sheet', async () => {
      const req: any = {}; // Mocking the request object
      const mockReadResult = { products: [] };

      mockExcelProductService.readFormatExcel.mockReturnValue(
        of(mockReadResult),
      );

      try {
        await service.handleFileUpload(req);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain('The Product data');
      }
    });
  });

  describe('createProduct', () => {
    it('should successfully create a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Product 1',
        categoryName: 'Category 1',
        harga: 100,
        categoryId: undefined,
        sku: undefined,
        description: undefined,
        weight: undefined,
        width: undefined,
        length: undefined,
        height: undefined,
        image: undefined,
      };
      const mockProduct = { id: 1, ...createProductDto };

      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockReturnValue(of(mockProduct));
      mockAuditLogService.createAuditLog.mockReturnValue(of(null));

      const result = await service.createProduct(createProductDto);

      expect(mockProductRepository.create).toHaveBeenCalledWith(
        createProductDto,
      );
      expect(mockProductRepository.save).toHaveBeenCalled();
      expect(mockAuditLogService.createAuditLog).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should throw BadRequestException if product creation fails', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Product 2',
        categoryName: 'Category 2',
        harga: 100,
        categoryId: undefined,
        sku: undefined,
        description: undefined,
        weight: undefined,
        width: undefined,
        length: undefined,
        height: undefined,
        image: undefined,
      };

      mockProductRepository.create.mockReturnValue(createProductDto);
      mockProductRepository.save.mockReturnValue(
        throwError(() => new Error('Creation error')),
      );

      try {
        await service.createProduct(createProductDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ExceptionsHandler);
      }
    });
  });

  describe('findProducts', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        {
          CategoryId: 1,
          categoryName: 'Cemilan Product',
          sku: 'MHZVTK',
          name: 'Ciki ciki',
          description: 'Ciki ciki yang super enak, hanya di toko klontong kami',
          weight: 500,
          width: 5,
          length: 5,
          height: 5,
          image:
            'https://cf.shopee.co.id/file/7cb930d1bd183a435f4fb3e5cc4a896b',
          harga: 30000,
        },
        {
          categoryId: 2,
          categoryName: 'Electronics Product',
          sku: 'LG12345',
          name: 'LG Full HD Smart TV 32LM635BPTB',
          description:
            '32-inch Full HD Smart TV with webOS and AI ThinQ. Perfect for home entertainment.',
          weight: 5.8,
          width: 73.8,
          length: 43.3,
          height: 9.5,
          image:
            'https://www.lg.com/id/images/tvs/md06143051/gallery/desktop-01.jpg',
          harga: 2999000,
        },
      ];
      const options = { page: 1, limit: 2, search: 'Product' };

      mockProductRepository.find.mockReturnValue(of(mockProducts));

      const result = await service.findProducts(options);

      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: expect.any(Array),
        skip: 0,
        take: 2,
      });
      expect(result.data.length).toBe(2);
      expect(result.meta.totalItems).toBe(2);
    });

    it('should throw NotFoundException if no products are found', async () => {
      const options = { page: 1, limit: 2, search: 'Non-existent Product' };

      mockProductRepository.find.mockReturnValue(of([]));

      try {
        await service.findProducts(options);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain('Product not found');
      }
    });
  });

  describe('productDetails', () => {
    it('should return product details by ID', async () => {
      const mockProduct = {
        id: 1,
        name: 'Product 1',
        categoryName: 'Category 1',
        harga: 100,
      };
      const id = 1;

      mockProductRepository.findOne.mockReturnValue(of(mockProduct));

      const result = await service.productDetails(id);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      const id = 1;

      mockProductRepository.findOne.mockReturnValue(of(null));

      try {
        await service.productDetails(id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain('Product with ID 1 not found');
      }
    });
  });

  describe('removeProduct', () => {
    it('should successfully remove a product', async () => {
      const mockProduct = { id: 1, name: 'Product 1' };
      const id = 1;

      mockProductRepository.findOne.mockReturnValue(of(mockProduct));
      mockProductRepository.delete.mockReturnValue(of({ affected: 1 }));
      mockAuditLogService.createAuditLog.mockReturnValue(of(null));

      await service.removeProduct(id);

      expect(mockProductRepository.delete).toHaveBeenCalledWith(id);
      expect(mockAuditLogService.createAuditLog).toHaveBeenCalled();
    });

    it('should throw BadRequestException if delete fails', async () => {
      const mockProduct = { id: 1, name: 'Product 1' };
      const id = 1;

      mockProductRepository.findOne.mockReturnValue(of(mockProduct));
      mockProductRepository.delete.mockReturnValue(
        throwError(() => new Error('Deletion failed')),
      );

      try {
        await service.removeProduct(id);
      } catch (error) {
        expect(error).toBeInstanceOf(ExceptionsHandler);
      }
    });
  });
});
