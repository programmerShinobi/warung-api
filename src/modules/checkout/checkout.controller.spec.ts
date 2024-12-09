/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { ItemsCheckoutDto } from './dtos/items-checkout.dto';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let service: CheckoutService;

  const mockCheckoutService = {
    createCheckout: jest.fn(),
    confirmCheckout: jest.fn(),
    getCheckoutsByUser: jest.fn(),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        {
          provide: CheckoutService,
          useValue: mockCheckoutService,
        },
      ],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCheckout', () => {
    it('should create a new checkout', async () => {
      const res = mockResponse();
      const userId = 1;
      const items: ItemsCheckoutDto[] = [
        {
          productId: 1,
          quantity: 2,
          price: 0,
          total: 0,
        },
        {
          productId: 2,
          quantity: 3,
          price: 0,
          total: 0,
        },
      ];

      const mockCheckout = {
        id: 1,
        userId,
        items,
        totalPrice: 300,
      };

      mockCheckoutService.createCheckout.mockResolvedValue(mockCheckout);

      await controller.createCheckout(res, userId, items);

      expect(mockCheckoutService.createCheckout).toHaveBeenCalledWith({
        userId,
        items,
      });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        data: mockCheckout,
        meta: { status: HttpStatus.CREATED },
        message: 'The product has been created.',
      });
    });
  });

  describe('confirmCheckout', () => {
    it('should confirm checkout by ID', async () => {
      const res = mockResponse();
      const id = 1;

      const mockCheckout = {
        id,
        userId: 1,
        items: [],
        totalPrice: 100,
        status: 'completed',
      };

      mockCheckoutService.confirmCheckout.mockResolvedValue(mockCheckout);

      await controller.confirmCheckout(res, id);

      expect(mockCheckoutService.confirmCheckout).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        data: mockCheckout,
        meta: { status: HttpStatus.OK, id },
        message: 'The checkout has been confirmed.',
      });
    });
  });

  describe('getCheckoutsByUser', () => {
    it('should return all checkouts by user ID', async () => {
      const res = mockResponse();
      const userId = 1;

      const mockCheckout = {
        id: 1,
        userId,
        items: [
          { productId: 1, price: 100, total: 200, quantity: 2 },
          { productId: 2, price: 50, total: 150, quantity: 3 },
        ],
        totalPrice: 350,
        status: 'pending',
      };

      mockCheckoutService.getCheckoutsByUser.mockResolvedValue(mockCheckout);

      await controller.getCheckoutsByUser(res, userId);

      expect(mockCheckoutService.getCheckoutsByUser).toHaveBeenCalledWith(
        userId,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        data: mockCheckout,
        meta: { status: HttpStatus.OK },
        message: 'Return all checkouts by user ID.',
      });
    });
  });
});
