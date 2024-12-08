import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './services/product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { UploadProductDto } from './dtos/upload-product.dto';

describe(ProductController.name, () => {
  let controller: ProductController;
  let productService: ProductService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            createProduct: jest.fn(),
            findProducts: jest.fn(),
            productDetails: jest.fn(),
            updateProduct: jest.fn(),
            removeProduct: jest.fn(),
            handleFileUpload: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProduct', () => {
    it('should successfully create a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Product A',
        harga: 100,
        categoryId: undefined,
        categoryName: undefined,
        sku: undefined,
        description: undefined,
        weight: undefined,
        width: undefined,
        length: undefined,
        height: undefined,
        image: undefined,
      };
      const product = { id: 1, ...createProductDto };
      productService.createProduct = jest.fn().mockResolvedValue(product);

      await controller.createProduct(
        mockResponse as Response,
        createProductDto,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: product,
        meta: { status: HttpStatus.CREATED },
        message: 'The product has been created.',
      });
    });

    it('should handle errors when creating a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Product A',
        harga: 100,
        categoryId: undefined,
        categoryName: undefined,
        sku: undefined,
        description: undefined,
        weight: undefined,
        width: undefined,
        length: undefined,
        height: undefined,
        image: undefined,
      };
      productService.createProduct = jest
        .fn()
        .mockRejectedValue(new Error('Failed to create product'));

      await controller.createProduct(
        mockResponse as Response,
        createProductDto,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to create product',
      });
    });
  });

  describe('findProducts', () => {
    it('should return a list of products with pagination', async () => {
      const products = [{ id: 1, name: 'Product A', harga: 100 }];
      const meta = { total: 1, page: 1, limit: 10 };
      productService.findProducts = jest
        .fn()
        .mockResolvedValue({ data: products, meta });

      await controller.findProducts(mockResponse as Response, 1, 10, '');

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: products,
        meta: { status: HttpStatus.OK, ...meta },
        message: 'Return all products.',
      });
    });

    it('should handle errors when finding products', async () => {
      productService.findProducts = jest
        .fn()
        .mockRejectedValue(new Error('Failed to find products'));

      await controller.findProducts(mockResponse as Response, 1, 10, '');

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to find products',
      });
    });
  });

  describe('productDetails', () => {
    it('should return product details by ID', async () => {
      const product = { id: 1, name: 'Product A', harga: 100 };
      productService.productDetails = jest.fn().mockResolvedValue(product);

      await controller.productDetails(mockResponse as Response, 1);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: product,
        meta: { status: HttpStatus.OK, id: 1 },
        message: 'Return product details.',
      });
    });

    it('should handle errors when getting product details', async () => {
      productService.productDetails = jest
        .fn()
        .mockRejectedValue(new Error('Product not found'));

      await controller.productDetails(mockResponse as Response, 1);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Product not found',
      });
    });
  });

  describe('updateProduct', () => {
    it('should successfully update a product', async () => {
      const updateProductDto = { name: 'Updated Product' };
      const updatedProduct = { id: 1, ...updateProductDto };
      productService.updateProduct = jest
        .fn()
        .mockResolvedValue(updatedProduct);

      await controller.updateProduct(
        mockResponse as Response,
        1,
        updateProductDto,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: updatedProduct,
        meta: { status: HttpStatus.OK, id: 1 },
        message: 'The product has been updated.',
      });
    });

    it('should handle errors when updating a product', async () => {
      const updateProductDto = { name: 'Updated Product' };
      productService.updateProduct = jest
        .fn()
        .mockRejectedValue(new Error('Failed to update product'));

      await controller.updateProduct(
        mockResponse as Response,
        1,
        updateProductDto,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to update product',
      });
    });
  });

  describe('remove', () => {
    it('should successfully remove a product', async () => {
      productService.removeProduct = jest.fn().mockResolvedValue(undefined);

      await controller.remove(mockResponse as Response, 1);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
      expect(mockResponse.json).toHaveBeenCalledWith({});
    });

    it('should handle errors when removing a product', async () => {
      productService.removeProduct = jest
        .fn()
        .mockRejectedValue(new Error('Failed to delete product'));

      await controller.remove(mockResponse as Response, 1);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to delete product',
      });
    });
  });

  describe('handleFileUpload', () => {
    it('should handle file upload successfully', async () => {
      const file: Express.Multer.File = {
        originalname: 'file.csv',
        size: 1234,
        fieldname: undefined,
        encoding: undefined,
        mimetype: undefined,
        stream: undefined,
        destination: undefined,
        filename: undefined,
        path: undefined,
        buffer: undefined,
      };
      const req = { file } as unknown as Request;
      productService.handleFileUpload = jest.fn().mockResolvedValue({});

      await controller.handleFileUpload(
        req,
        mockResponse as Response,
        {} as UploadProductDto,
        file,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: {},
        meta: {
          fileName: 'file.csv',
          fileSize: 1234,
          status: HttpStatus.CREATED,
        },
        message: 'File uploaded successfully.',
      });
    });

    it('should handle errors when uploading file', async () => {
      const req = { file: null } as unknown as Request;
      productService.handleFileUpload = jest
        .fn()
        .mockRejectedValue(new Error('Failed to upload file'));

      await controller.handleFileUpload(
        req,
        mockResponse as Response,
        {} as UploadProductDto,
        null,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Failed to upload file',
      });
    });
  });
});
