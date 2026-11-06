import { CouponsController } from './coupons.controller';
import type { CouponsService } from './coupons.service';

describe('CouponsController', () => {
  const service = {
    quote: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    toggle: jest.fn(),
    remove: jest.fn(),
  };
  const controller = new CouponsController(
    service as unknown as CouponsService,
  );

  it('validate no expone el id interno del cupón', async () => {
    service.quote.mockResolvedValue({
      id: 9,
      code: 'A',
      discountAmount: 1,
      finalAmount: 9,
    });
    await expect(
      controller.validate({ code: 'A', amount: 10 }),
    ).resolves.toEqual({
      code: 'A',
      discountAmount: 1,
      finalAmount: 9,
    });
  });

  it('delega las operaciones de administración', () => {
    controller.findAll();
    controller.toggle(1);
    controller.remove(1);
    expect(service.findAll).toHaveBeenCalled();
    expect(service.toggle).toHaveBeenCalledWith(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
