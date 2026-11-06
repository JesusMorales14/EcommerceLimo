import { UsersController } from './users.controller';
import type { UsersService } from './users.service';

describe('UsersController', () => {
  const service = { findAll: jest.fn(), findOne: jest.fn() };
  const controller = new UsersController(service as unknown as UsersService);

  it('delega en el servicio', async () => {
    service.findAll.mockResolvedValue([]);
    service.findOne.mockResolvedValue({ id: 2 });
    await expect(controller.findAll()).resolves.toEqual([]);
    await expect(controller.findOne(2)).resolves.toEqual({ id: 2 });
  });
});
