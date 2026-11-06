import { ProductsController } from './products.controller';
import type { ProductsService } from './products.service';

describe('ProductsController', () => {
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const controller = new ProductsController(
    service as unknown as ProductsService,
  );

  it('delega todas las operaciones en el servicio', () => {
    const query = { page: 1, limit: 40, category: 'tecnologia' };
    controller.findAll(query);
    controller.findOne(1);
    controller.update(1, { stock: 2 });
    controller.remove(1);

    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(service.update).toHaveBeenCalledWith(1, { stock: 2 });
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
