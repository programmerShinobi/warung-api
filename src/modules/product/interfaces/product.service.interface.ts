import { Request } from 'express';
import { Products } from '../entities/product.entity';
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
   * @returns Promise<Products>
   */
  createProduct(createProductDto: CreateProductDto): Promise<Products>;

  /**
   * Find Products
   * @param options { page: number; limit: number; search: string; }
   * @returns Promise<PaginationResultDto<Products>>
   */
  findProducts(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<PaginationResultDto<Products>>;

  /**
   * Product Details
   * @param id number
   * @returns Promise<Products>
   */
  productDetails(id: number): Promise<Products>;

  /**
   * Update Product
   * @param id number
   * @param updateProductDto Partial<CreateProductDto>
   * @returns Promise<Products>
   */
  updateProduct(
    id: number,
    updateProductDto: Partial<CreateProductDto>,
  ): Promise<Products>;

  /**
   * Remove Product
   * @param id number
   */
  removeProduct(id: number): Promise<void>;
}
