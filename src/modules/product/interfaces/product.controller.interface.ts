import { Request, Response } from 'express';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UploadProductDto } from '../dtos/upload-product.dto';

export interface ProductControllerInterface {
  createProduct(
    res: Response,
    createProductDto: CreateProductDto,
  ): Promise<Response>;

  findProducts(
    res: Response,
    page: number,
    limit: number,
    search: string,
  ): Promise<Response>;

  productDetails(res: Response, id: number): Promise<Response>;

  updateProduct(
    res: Response,
    id: number,
    updateProductDto: Partial<CreateProductDto>,
  ): Promise<Response>;

  remove(res: Response, id: number): Promise<Response>;

  handleFileUpload(
    req: Request,
    res: Response,
    _dto: UploadProductDto,
    _file: Express.Multer.File,
  ): Promise<Response>;
}
