/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import BaseController from 'src/core/base.controller';
import { ProductService } from './services/product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { Request, Response } from 'express';
import { TagController } from 'src/core/enums/tag-controller.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer-options.config';
import { UploadProductDto } from './dtos/upload-product.dto';
import { ProductControllerInterface } from './interfaces/product.controller.interface';

@ApiTags(TagController.PRODUCT)
@Controller({
  version: '1',
  path: 'product',
})
export class ProductController extends BaseController implements ProductControllerInterface {
  constructor(private readonly productService: ProductService) {
    super(ProductController.name);
  }

  /**
   * Create Product
   * @param res Response
   * @param createProductDto CreateProductDto
   * @returns Promise<Response>
   */
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'The product has been created.' })
  @ApiResponse({ status: 400, description: 'The product has been failed.' })
  async createProduct(
    @Res() res: Response,
    @Body() createProductDto: CreateProductDto,
  ): Promise<Response> {
    try {
      const data = await this.productService.createProduct(createProductDto);

      const meta = data.id
        ? {
            status: HttpStatus.CREATED,
          }
        : undefined;

      const message = 'The product has been created.';

      return this.responseCreated(res, data, meta, message);
    } catch (error) {
      return this.responseError(res, error);
    }
  }

  /**
   * Find products
   * @param res Response
   * @param page number
   * @param limit limit
   * @param search string
   * @returns Promise<Response>
   */
  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: 'Page query.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Limit query.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: 'string',
    description: 'Search query.',
  })
  @ApiOperation({ summary: 'Get all products with pagination and search.' })
  @ApiResponse({ status: 200, description: 'Return all products.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findProducts(
    @Res() res: Response,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ): Promise<Response> {
    try {
      const { data, meta } = await this.productService.findProducts({
        page,
        limit,
        search,
      });

      const message = 'Return all products.';

      return this.responseOk(
        res,
        data,
        {
          status: HttpStatus.OK,
          ...meta,
        },
        message,
      );
    } catch (error) {
      return this.responseError(res, error);
    }
  }

  /**
   * Product Details
   * @param res Response
   * @param id number
   * @returns Promise<Response>
   */
  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: 'ID params.',
  })
  @ApiOperation({ summary: 'Get product details by ID' })
  @ApiResponse({ status: 200, description: 'Return product details.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async productDetails(
    @Res() res: Response,
    @Param('id') id: number,
  ): Promise<Response> {
    try {
      const data = await this.productService.productDetails(id);

      const meta = data.id
        ? {
            status: HttpStatus.OK,
            id: Number(id),
          }
        : undefined;

      const message = 'Return product details.';

      return this.responseOk(res, data, meta, message);
    } catch (error) {
      return this.responseError(res, error);
    }
  }

  /**
   * Update Product
   * @param res Response
   * @param id number
   * @param updateProductDto Partial<CreateProductDto>
   * @returns Promise<Response>
   */
  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: 'ID params.',
  })
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiResponse({ status: 200, description: 'The product has been updated.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({
    status: 400,
    description: 'Product data failed to update.',
  })
  async updateProduct(
    @Res() res: Response,
    @Param('id') id: number,
    @Body() updateProductDto: Partial<CreateProductDto>,
  ): Promise<Response> {
    try {
      const data = await this.productService.updateProduct(
        id,
        updateProductDto,
      );

      const meta = data.id
        ? {
            status: HttpStatus.OK,
            id: Number(id),
          }
        : undefined;

      const message = 'The product has been updated.';

      return this.responseOk(res, data, meta, message);
    } catch (error) {
      return this.responseError(res, error);
    }
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: 'ID params.',
  })
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiResponse({
    status: 204,
    description: 'Product has been deleted. (Not Content)',
  })
  @ApiResponse({
    status: 400,
    description: 'Product data failed to delete.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async remove(
    @Res() res: Response,
    @Param('id') id: number,
  ): Promise<Response> {
    try {
      await this.productService.removeProduct(id);

      return this.responseNoContent(res);
    } catch (error) {
      return this.responseError(res, error);
    }
  }

  /**
   * Handle File Upload
   * @param req Request
   * @param res Response
   * @param file Express.Multer.File
   * @returns Promise<Response>
   */
  @Post('upload')
  @ApiOperation({ summary: 'Handle File Upload (Product)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async handleFileUpload(
    @Req() req: Request,
    @Res() res: Response,
    @Body() _dto: UploadProductDto,
    @UploadedFile() _file: Express.Multer.File,
  ): Promise<Response> {
    try {
      const data = await this.productService.handleFileUpload(req);

      const meta = {
        fileName: req?.file?.originalname,
        fileSize: req?.file?.size,
        status: HttpStatus.CREATED,
      };

      const message = 'File uploaded successfully.';

      return this.responseCreated(res, data, meta, message);
    } catch (error) {
      return this.responseError(res, error);
    }
  }
}
