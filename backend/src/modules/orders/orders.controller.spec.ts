import { OrdersController } from './orders.controller';
import type { OrdersService } from './orders.service';

describe('OrdersController', () => {
  const service = {
    createOrder: jest.fn(),
    getUserOrders: jest.fn(),
    getAllOrders: jest.fn(),
    updateStatus: jest.fn(),
  };
  const controller = new OrdersController(service as unknown as OrdersService);
  const user = { id: 3, email: 'a@a.com', role: 'USER' as const };

  it('usa el usuario autenticado y delega en el servicio', () => {
    const dto = { items: [{ productId: 1, quantity: 1 }] };
    controller.create(user, dto);
    controller.mine(user);
    controller.all();
    controller.updateStatus(5, { status: 'DELIVERED' });

    expect(service.createOrder).toHaveBeenCalledWith(3, dto);
    expect(service.getUserOrders).toHaveBeenCalledWith(3);
    expect(service.getAllOrders).toHaveBeenCalled();
    expect(service.updateStatus).toHaveBeenCalledWith(5, {
      status: 'DELIVERED',
    });
  });
});
