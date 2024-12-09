import { CreateCheckoutDto } from '../dtos/create-checkout.dto';
import { Checkout } from '../entities/checkout.entity';

export interface CheckoutServiceInterface {
  /**
   * Create Checkout
   * @param createCheckoutDto CreateCheckoutDto
   * @returns Promise<Checkout>
   */
  createCheckout(createCheckoutDto: CreateCheckoutDto): Promise<Checkout>;

  /**
   * Confirm Checkout
   * @param createCheckoutDto CreateCheckoutDto
   * @returns Promise<Checkout>
   */
  confirmCheckout(id: number): Promise<Checkout>;

  /**
   * Get Checkouts By User
   * @param userId number
   * @returns Promise<Checkout>
   */
  getCheckoutsByUser(userId: number): Promise<Checkout>;
}
