import { Request } from 'express';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dtos/create-product.dto';
import { PaginationResultDto } from '../dtos/pagination-result.dto';
import { ItemsProductDto } from '../dtos/items-product.dto';

export interface ProductServiceInterface {
  /**
   * Handle File Upload
   * @param req Request
   * @returns Promise<ItemsProductDto[]>
   */
  handleFileUpload(req: Request): Promise<ItemsProductDto[]>;

  /**
   * Create Product
   * @param createProductDto CreateProductDto
   * @returns Promise<Product>
   */
  createProduct(createProductDto: CreateProductDto): Promise<Product>;

  /**
   * Find Product
   * @param options { page: number; limit: number; search: string; }
   * @returns Promise<PaginationResultDto<Product>>
   */
  findProducts(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<PaginationResultDto<Product>>;

  /**
   * Product Details
   * @param id number
   * @returns Promise<Product>
   */
  productDetails(id: number): Promise<Product>;

  /**
   * Update Product
   * @param id number
   * @param updateProductDto Partial<CreateProductDto>
   * @returns Promise<Product>
   */
  updateProduct(
    id: number,
    updateProductDto: Partial<CreateProductDto>,
  ): Promise<Product>;

  /**
   * Remove Product
   * @param id number
   */
  removeProduct(id: number): Promise<void>;
}
