import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkout } from './entities/checkout.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { TableNameEnum } from 'src/core/enums/table-name.enum';
import { OperatorNameEnum } from 'src/core/enums/operator-name.enum';
import { CreateCheckoutDto } from './dtos/create-checkout.dto';
import {
  catchError,
  concatMap,
  from,
  lastValueFrom,
  of,
  switchMap,
} from 'rxjs';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { ProductService } from '../product/services/product.service';
import { BaseService } from 'src/core/base.service';
import { CheckoutServiceInterface } from './interfaces/checkout.service.interface';
import { ItemsCheckoutDto } from './dtos/items-checkout.dto';

@Injectable()
export class CheckoutService
  extends BaseService
  implements CheckoutServiceInterface
{
  constructor(
    @InjectRepository(Checkout)
    private readonly checkoutRepository: Repository<Checkout>,
    private readonly productService: ProductService,
    private readonly auditLogService: AuditLogService,
  ) {
    super(CheckoutService.name);
  }

  /**
   * Create Checkout
   * @param createCheckoutDto CreateCheckoutDto
   * @returns Promise<Checkout>
   */
  async createCheckout(
    createCheckoutDto: CreateCheckoutDto,
  ): Promise<Checkout> {
    try {
      const { userId, items } = createCheckoutDto;

      if (items.length === 0)
        throw new BadRequestException('Items must not be empty.');

      const productPrices: {
        productId: number;
        price: number;
      }[] = [];

      const $checkItemsFromDatabase = from(items).pipe(
        concatMap((item) =>
          from(this.productService.productDetails(item.productId)).pipe(
            switchMap((product) => {
              if (!product)
                throw new BadRequestException(
                  `Product with ID ${item.productId} not found.`,
                );

              productPrices.push({
                productId: item.productId,
                price: product.harga,
              });

              return of(product);
            }),
          ),
        ),
      );
      await lastValueFrom($checkItemsFromDatabase);

      if (productPrices.length === 0)
        throw new NotFoundException('Product not found.');

      let totalPrice = 0;

      const detailedItems: {
        price: number;
        total: number;
        productId: number;
        quantity: number;
      }[] = [];

      const $calculateItemsFromDatabase = from(items).pipe(
        concatMap((item) => {
          const productPrice = productPrices.find(
            (p) => p.productId === item.productId,
          )?.price;
          if (!productPrice)
            throw new BadRequestException(
              `Price for product ID ${item.productId} not found.`,
            );

          const itemTotal = productPrice * item.quantity;
          totalPrice += itemTotal;

          detailedItems.push({
            ...item,
            price: Number(productPrice),
            total: Number(itemTotal),
          });

          return of(item);
        }),
      );
      await lastValueFrom($calculateItemsFromDatabase);

      if (detailedItems.length === 0)
        throw new NotFoundException('Item Details not found.');

      const checkoutData = {
        userId,
        items: detailedItems,
        totalPrice,
      };

      let data: Checkout = undefined;

      const $data = of(this.checkoutRepository.create(checkoutData)).pipe(
        catchError((error) => {
          throw new ExceptionsHandler(error);
        }),
        switchMap((newCheckout) =>
          from(this.checkoutRepository.save(newCheckout)).pipe(
            catchError((error) => {
              throw new ExceptionsHandler(error);
            }),
            switchMap((savedCheckout) => {
              return from(
                this.auditLogService.createAuditLog(
                  TableNameEnum.CHECKOUTS,
                  OperatorNameEnum.CREATE,
                  JSON.stringify(checkoutData),
                ),
              ).pipe(
                catchError(() => {
                  data = undefined;
                  return from(this.checkoutRepository.delete(newCheckout.id));
                }),
                switchMap(() => {
                  data = savedCheckout;
                  return of(null);
                }),
              );
            }),
          ),
        ),
      );
      await lastValueFrom($data);

      if (!data)
        throw new BadRequestException('The create checkout has been failed.');

      return data;
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  /**
   * Confirm Checkout
   * @param createCheckoutDto CreateCheckoutDto
   * @returns Promise<Checkout>
   */
  async confirmCheckout(id: number): Promise<Checkout> {
    try {
      let checkoutData: Checkout = undefined;

      const $checkoutData = from(
        this.checkoutRepository.findOne({ where: { id } }),
      ).pipe(
        catchError((error) => {
          throw new ExceptionsHandler(error);
        }),
        switchMap((checkout) => {
          if (!checkout)
            throw new NotFoundException(`Checkout with ID ${id} not found.`);

          checkout.status = 'completed';

          return from(this.checkoutRepository.save(checkout)).pipe(
            catchError((error) => {
              throw new ExceptionsHandler(error);
            }),
            switchMap((savedCheckout) => {
              checkoutData = savedCheckout;
              return from(
                this.auditLogService.createAuditLog(
                  TableNameEnum.CHECKOUTS,
                  OperatorNameEnum.UPDATE,
                  JSON.stringify(checkout),
                ),
              ).pipe(
                catchError(() => {
                  checkoutData = undefined;
                  checkout.status = null;
                  return from(this.checkoutRepository.save(checkout));
                }),
              );
            }),
          );
        }),
      );
      await lastValueFrom($checkoutData);

      if (!checkoutData)
        throw new BadRequestException('The confirm checkout has been failed.');

      return this.getCheckoutData(checkoutData);
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  /**
   * Get Checkouts By User
   * @param userId number
   * @returns Promise<Checkout>
   */
  async getCheckoutsByUser(userId: number): Promise<Checkout> {
    try {
      const $checkoutData = from(
        this.checkoutRepository.findOne({ where: { userId } }),
      ).pipe(
        catchError((error) => {
          throw new ExceptionsHandler(error);
        }),
      );
      const checkoutData = await lastValueFrom($checkoutData);
      if (!checkoutData)
        throw new NotFoundException(
          `Checkout with user ID ${userId} not found.`,
        );

      return this.getCheckoutData(checkoutData);
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }

  /**
   * Get Checkout Data
   * @param checkoutData Checkout
   * @returns Promise<Checkout>
   */
  private async getCheckoutData(checkoutData: Checkout): Promise<Checkout> {
    const items: ItemsCheckoutDto[] = [];

    const $checkoutDataWithItems = from(checkoutData.items).pipe(
      concatMap((item) => {
        items.push({
          ...item,
          price: Number(item.price),
          total: Number(item.total),
        });
        return of(item);
      }),
    );
    await lastValueFrom($checkoutDataWithItems);

    const data: Checkout = {
      ...checkoutData,
      items,
    };

    return data;
  }
}
