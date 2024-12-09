import { Response } from 'express';
import { ItemsCheckoutDto } from '../dtos/items-checkout.dto';

export interface CheckoutControllerInterface {
  /**
   * Create Checkout
   * @param res Response
   * @param userId number
   * @param items ItemsCheckoutDto[]
   * @returns Promise<Response>
   */
  createCheckout(
    res: Response,
    userId: number,
    items: ItemsCheckoutDto[],
  ): Promise<Response>;

  /**
   * Confirm Checkout
   * @param res Response
   * @param id number
   * @returns Promise<Response>
   */
  confirmCheckout(res: Response, id: number): Promise<Response>;

  /**
   * Get Checkouts By User
   * @param res Response
   * @param id number
   * @returns Promise<Response>
   */
  getCheckoutsByUser(res: Response, userId: number): Promise<Response>;
}
