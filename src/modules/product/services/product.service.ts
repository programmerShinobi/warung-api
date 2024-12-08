import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base.service';
import { ILike, Repository } from 'typeorm';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { Products } from '../entities/product.entity';
import { AuditLogService } from 'src/modules/audit-log/audit-log.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { PaginationResultDto } from '../dtos/pagination-result.dto';
import { Request } from 'express';
import {
  catchError,
  concatMap,
  from,
  lastValueFrom,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { TableNameEnum } from 'src/core/enums/table-name.enum';
import { OperatorNameEnum } from 'src/core/enums/operator-name.enum';
import { SheetNameEnum } from 'src/core/enums/sheet-name.enum';
import { ExcelProductService } from './excel-product.service';
import { ItemsProductDto } from '../dtos/items-product.dto';
import { ReadProductSheetDto } from '../dtos/read-product-sheet.dto';
import { ProductServiceInterface } from '../interfaces/product.service.interface';

@Injectable()
export class ProductService
  extends BaseService
  implements ProductServiceInterface
{
  constructor(
    @InjectRepository(Products)
    private readonly productRepository: Repository<Products>,
    private readonly auditLogService: AuditLogService,
    private readonly excelService: ExcelProductService,
  ) {
    super(ProductService.name);
  }

  /**
   * Handle File Upload
   * @param req Request
   * @param file Express.Multer.File
   * @returns Promise<ItemsProductDto[]>
   */
  async handleFileUpload(req: Request): Promise<ItemsProductDto[]> {
    try {
      const sheetName = SheetNameEnum.PRODUCTS;

      if (!sheetName) throw new BadRequestException(`Sheet name not found`);

      const read: ReadProductSheetDto =
        await this.excelService.readFormatExcel(req);
      if (!read?.products)
        throw new BadRequestException(`Sheet name must be '${sheetName}'`);

      const readResult: ItemsProductDto[] = read?.products;
      if (readResult.length === 0)
        throw new BadRequestException(
          `The Product data [${SheetNameEnum.PRODUCTS} sheet] not found & input process failed, please try again.`,
        );

      const values: ItemsProductDto[] = [];

      const $data = from(readResult).pipe(
        tap((data) =>
          this.logger.verbose(
            `Save => [${
              data?.name
            }] from [${SheetNameEnum.PRODUCTS} sheet] to [${
              TableNameEnum.PRODUCTS
            } table]`,
          ),
        ),
        concatMap((item) => {
          return from(this.createProduct(item)).pipe(
            catchError((error) => {
              return throwError(() => {
                throw new ExceptionsHandler(error);
              });
            }),
            switchMap(() => {
              values.push(item);
              return of(item);
            }),
          );
        }),
      );
      await lastValueFrom($data);

      return values;
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  /**
   * Create Product
   * @param createProductDto CreateProductDto
   * @returns Promise<Products>
   */
  async createProduct(createProductDto: CreateProductDto): Promise<Products> {
    try {
      let data: Products = undefined;

      const $data = of(this.productRepository.create(createProductDto)).pipe(
        catchError((error) => {
          throw new ExceptionsHandler(error);
        }),
        switchMap((product) =>
          from(this.productRepository.save(product)).pipe(
            catchError((error) => {
              throw new ExceptionsHandler(error);
            }),
            switchMap((savedProduct) => {
              data = savedProduct;
              return from(
                this.auditLogService.createAuditLog(
                  TableNameEnum.PRODUCTS,
                  OperatorNameEnum.CREATE,
                  JSON.stringify(createProductDto),
                ),
              ).pipe(
                catchError(() => {
                  data = undefined;
                  return from(this.productRepository.delete(product.id));
                }),
              );
            }),
          ),
        ),
      );
      await lastValueFrom($data);

      if (!data) throw new BadRequestException('The product has been failed.');
      return data;
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  /**
   * Find Products
   * @param options {
   *          page: number;
   *          limit: number;
   *          search: string;
   *        }
   * @returns Promise<{ data: Products[]; total: number }>
   */
  async findProducts(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<PaginationResultDto<Products>> {
    try {
      const { page, limit, search } = options;

      const currentPage = Math.max(page, 1);
      const pageSize = Math.max(limit, 1);

      const skip = (currentPage - 1) * pageSize;

      const where = search
        ? [
            {
              name: ILike(`%${search.toLowerCase()}%`),
            },
            {
              categoryName: ILike(`%${search.toLowerCase()}%`),
            },
          ]
        : {};

      const data = [];
      const $data = from(
        this.productRepository.find({
          where,
          skip,
          take: pageSize,
        }),
      ).pipe(
        catchError((error) => {
          throw new ExceptionsHandler(error);
        }),
        switchMap((products) => {
          if (products.length === 0)
            throw new NotFoundException('Products not found.');

          return from(products).pipe(
            concatMap((product) => {
              data.push({
                ...product,
                weight: Number(product.weight),
                width: Number(product.width),
                length: Number(product.length),
                height: Number(product.height),
                harga: Number(product.harga),
              });

              return of(product);
            }),
          );
        }),
      );
      await lastValueFrom($data);

      const totalItems = data.length;
      if (totalItems === 0) throw new NotFoundException('Products not found.');

      return {
        data,
        meta: {
          totalItems,
          currentPage,
          itemsPerPage: pageSize,
          totalPages: Math.ceil(totalItems / pageSize),
          hasNextPage: currentPage < Math.ceil(totalItems / pageSize),
          hasPreviousPage: currentPage > 1,
        },
      };
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  /**
   * Product Details
   * @param id number
   * @returns Promise<Products>
   */
  async productDetails(id: number): Promise<Products> {
    try {
      const $data = from(
        this.productRepository.findOne({ where: { id } }),
      ).pipe(
        catchError((error) => {
          throw new ExceptionsHandler(error);
        }),
      );
      const data = await lastValueFrom($data);

      if (!data)
        throw new NotFoundException(`Product with ID ${id} not found.`);

      return data;
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  /**
   * Update Product
   * @param id number
   * @param updateProductDto Partial<CreateProductDto>
   * @returns Promise<Products>
   */
  async updateProduct(
    id: number,
    updateProductDto: Partial<CreateProductDto>,
  ): Promise<Products> {
    try {
      let data: Products = undefined;
      const $data = from(this.productDetails(id)).pipe(
        catchError((error) => {
          throw new ExceptionsHandler(error);
        }),
        switchMap((product) => {
          if (updateProductDto?.['id'])
            throw new BadRequestException('Unable to change ID');

          const updatedProduct = Object.assign(product, updateProductDto);

          return from(this.productRepository.save(updatedProduct)).pipe(
            catchError((error) => {
              throw new ExceptionsHandler(error);
            }),
            switchMap((product) =>
              from(
                this.auditLogService.createAuditLog(
                  TableNameEnum.PRODUCTS,
                  OperatorNameEnum.UPDATE,
                  JSON.stringify(updateProductDto),
                ),
              ).pipe(
                catchError(() => {
                  data = undefined;
                  return from(this.productRepository.save(product));
                }),
                switchMap(() => {
                  data = product;
                  return of(null);
                }),
              ),
            ),
          );
        }),
      );
      await lastValueFrom($data);

      if (!data)
        throw new BadRequestException(`Product data failed to update.`);

      return data;
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  /**
   * Remove Product
   * @param id number
   */
  async removeProduct(id: number): Promise<void> {
    try {
      let data = undefined;
      const $data = from(this.productDetails(id)).pipe(
        catchError((error) => {
          throw new ExceptionsHandler(error);
        }),
        switchMap((product) =>
          from(this.productRepository.delete(id)).pipe(
            catchError((error) => {
              throw new ExceptionsHandler(error);
            }),
            switchMap(() =>
              from(
                this.auditLogService.createAuditLog(
                  TableNameEnum.PRODUCTS,
                  OperatorNameEnum.DELETE,
                  JSON.stringify(product),
                ),
              ).pipe(
                catchError(() => {
                  data = product;
                  return from(this.productRepository.save(product));
                }),
              ),
            ),
          ),
        ),
      );
      await lastValueFrom($data);

      if (data) throw new BadRequestException('Product data failed to delete.');
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }
}
