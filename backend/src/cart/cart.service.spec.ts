import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartService],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should add item', () => {
    const result = service.addItem(1);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual({
      productId: 1,
      quantity: 1,
    });
  });

  it('should increment quantity if item exists', () => {
    service.addItem(1);
    const result = service.addItem(1);

    expect(result.items[0].quantity).toBe(2);
  });
});
