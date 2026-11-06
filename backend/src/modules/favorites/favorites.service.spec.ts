import type { FavoritesRepository } from './favorites.repository';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  const repo = {
    find: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
    findProductsByUser: jest.fn(),
    findProductIdsByUser: jest.fn(),
  };
  const service = new FavoritesService(repo as unknown as FavoritesRepository);

  beforeEach(() => jest.clearAllMocks());

  it('toggle agrega si no existía', async () => {
    repo.find.mockResolvedValue(null);
    await expect(service.toggle(1, 5)).resolves.toEqual({
      favorited: true,
      productId: 5,
    });
    expect(repo.add).toHaveBeenCalledWith(1, 5);
  });

  it('toggle quita si ya existía', async () => {
    repo.find.mockResolvedValue({ id: 9 });
    await expect(service.toggle(1, 5)).resolves.toEqual({
      favorited: false,
      productId: 5,
    });
    expect(repo.remove).toHaveBeenCalledWith(9);
  });

  it('remove es idempotente', async () => {
    repo.find.mockResolvedValue(null);
    await expect(service.remove(1, 5)).resolves.toEqual({
      favorited: false,
      productId: 5,
    });
    expect(repo.remove).not.toHaveBeenCalled();
  });

  it('consultas delegan en el repositorio', async () => {
    repo.findProductsByUser.mockResolvedValue([{ id: 1 }]);
    repo.findProductIdsByUser.mockResolvedValue([1]);
    await expect(service.getProducts(1)).resolves.toEqual([{ id: 1 }]);
    await expect(service.getProductIds(1)).resolves.toEqual([1]);
  });
});
