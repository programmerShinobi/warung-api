import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TagController } from 'src/core/enums/tag-controller.enum';
import { ItemsCheckoutDto } from './dtos/items-checkout.dto';
import BaseController from 'src/core/base.controller';
import { Response } from 'express';
import { CheckoutControllerInterface } from './interfaces/checkout.controller.interface';

@ApiTags(TagController.CHECKOUT)
@Controller({
  version: '1',
  path: 'checkout',
})
export class CheckoutController
  extends BaseController
  implements CheckoutControllerInterface
{
  constructor(private readonly checkoutService: CheckoutService) {
    super(CheckoutController.name);
  }

  /**
   * Create Checkout
   * @param res Response
   * @param userId number
   * @param items ItemsCheckoutDto[]
   * @returns Promise<Response>
   */
  @Post()
  @ApiOperation({ summary: 'Create a new checkout' })
  @ApiResponse({ status: 201, description: 'The checkout has been created.' })
  @ApiResponse({ status: 400, description: 'The checkout has been failed.' })
  async createCheckout(
    @Res() res: Response,
    @Body('userId') userId: number,
    @Body('items') items: ItemsCheckoutDto[],
  ): Promise<Response> {
    try {
      const data = await this.checkoutService.createCheckout({ userId, items });

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
   * Confirm Checkout
   * @param res Response
   * @param id number
   * @returns Promise<Response>
   */
  @Patch(':id/confirm')
  @ApiParam({
    name: 'id',
    required: true,
    type: 'number',
    description: 'ID params.',
  })
  @ApiOperation({ summary: 'Confirm checkout by ID' })
  @ApiResponse({ status: 200, description: 'The checkout has been confirmed.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({
    status: 400,
    description: 'Checkout data failed to confirm.',
  })
  async confirmCheckout(
    @Res() res: Response,
    @Param('id') id: number,
  ): Promise<Response> {
    try {
      const data = await this.checkoutService.confirmCheckout(id);

      const meta = data.id
        ? {
            status: HttpStatus.OK,
            id: Number(id),
          }
        : undefined;

      const message = 'The checkout has been confirmed.';

      return this.responseOk(res, data, meta, message);
    } catch (error) {
      return this.responseError(res, error);
    }
  }

  /**
   * Get Checkouts By User
   * @param res Response
   * @param id number
   * @returns Promise<Response>
   */
  @Get(':userId')
  @ApiParam({
    name: 'userId',
    required: true,
    type: 'number',
    description: 'user ID params.',
  })
  @ApiOperation({ summary: 'Get all checkouts.' })
  @ApiResponse({ status: 200, description: 'Return all checkouts.' })
  @ApiResponse({ status: 404, description: 'Checkout not found.' })
  async getCheckoutsByUser(
    @Res() res: Response,
    @Param('userId') userId: number,
  ): Promise<Response> {
    try {
      const data = await this.checkoutService.getCheckoutsByUser(userId);

      const meta = data
        ? {
            status: HttpStatus.OK,
          }
        : undefined;

      const message = 'Return all checkouts by user ID.';

      return this.responseOk(res, data, meta, message);
    } catch (error) {
      return this.responseError(res, error);
    }
  }
}
