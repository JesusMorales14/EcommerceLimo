import { FavoritesController } from './favorites.controller';
import type { FavoritesService } from './favorites.service';

describe('FavoritesController', () => {
  const service = {
    getProducts: jest.fn(),
    getProductIds: jest.fn(),
    toggle: jest.fn(),
    remove: jest.fn(),
  };
  const controller = new FavoritesController(
    service as unknown as FavoritesService,
  );
  const user = { id: 2, email: 'a@a.com', role: 'USER' as const };

  it('opera siempre sobre el usuario autenticado', () => {
    controller.getAll(user);
    controller.getIds(user);
    controller.toggle(user, 7);
    controller.remove(user, 7);
    expect(service.getProducts).toHaveBeenCalledWith(2);
    expect(service.getProductIds).toHaveBeenCalledWith(2);
    expect(service.toggle).toHaveBeenCalledWith(2, 7);
    expect(service.remove).toHaveBeenCalledWith(2, 7);
  });
});
