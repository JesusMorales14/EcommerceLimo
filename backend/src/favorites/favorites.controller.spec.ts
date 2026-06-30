import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  let service: any;

  beforeEach(async () => {
    service = {
      getUserFavorites: jest.fn(),
      getFavoriteIds: jest.fn(),
      toggleFavorite: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [{ provide: FavoritesService, useValue: service }],
    }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  const req = { user: { id: 1 } };

  describe('getAll', () => {
    it('delega en el service usando el id del usuario autenticado', () => {
      service.getUserFavorites.mockReturnValue([{ id: 1 }]);

      const result = controller.getAll(req);

      expect(service.getUserFavorites).toHaveBeenCalledWith(1);
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getIds', () => {
    it('delega en el service usando el id del usuario autenticado', () => {
      service.getFavoriteIds.mockReturnValue([1, 2]);

      const result = controller.getIds(req);

      expect(service.getFavoriteIds).toHaveBeenCalledWith(1);
      expect(result).toEqual([1, 2]);
    });
  });

  describe('toggle', () => {
    it('delega en el service convirtiendo productId a número', () => {
      service.toggleFavorite.mockReturnValue({ favorited: true, productId: 5 });

      const result = controller.toggle(req, '5');

      expect(service.toggleFavorite).toHaveBeenCalledWith(1, 5);
      expect(result).toEqual({ favorited: true, productId: 5 });
    });
  });

  describe('remove', () => {
    it('delega en toggleFavorite (toggle también remueve) convirtiendo productId a número', () => {
      service.toggleFavorite.mockReturnValue({
        favorited: false,
        productId: 5,
      });

      const result = controller.remove(req, '5');

      expect(service.toggleFavorite).toHaveBeenCalledWith(1, 5);
      expect(result).toEqual({ favorited: false, productId: 5 });
    });
  });
});
