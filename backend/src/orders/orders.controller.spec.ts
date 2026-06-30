import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

const mockOrdersService = {
  createOrder: jest.fn(),
  getUserOrders: jest.fn(),
  getAllOrders: jest.fn(),
  updateStatus: jest.fn(),
};

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockOrdersService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });
});
