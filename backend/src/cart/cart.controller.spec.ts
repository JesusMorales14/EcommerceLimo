import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

const mockCartService = {
  getCart: jest.fn(),
  addItem: jest.fn(),
};

describe('CartController', () => {
  let controller: CartController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: mockCartService }],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('getCart delega en cartService.getCart', () => {
    mockCartService.getCart.mockReturnValue({ userId: 1, items: [] });
    controller.getCart();
    expect(mockCartService.getCart).toHaveBeenCalled();
  });
});
