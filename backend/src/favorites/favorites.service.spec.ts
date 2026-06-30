import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../prisma/prisma.service';

const mockProduct = {
  id: 1,
  name: 'Samsung Galaxy S24',
  brand: 'Samsung',
  price: 1899,
};

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      favorite: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FavoritesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  // ── toggleFavorite ───────────────────────────────────────────────────────────

  describe('toggleFavorite', () => {
    it('agrega el producto a favoritos si no existía', async () => {
      prisma.favorite.findUnique.mockResolvedValue(null);
      prisma.favorite.create.mockResolvedValue({ id: 1, userId: 1, productId: 1 });

      const result = await service.toggleFavorite(1, 1);

      expect(prisma.favorite.create).toHaveBeenCalledWith({
        data: { userId: 1, productId: 1 },
      });
      expect(prisma.favorite.delete).not.toHaveBeenCalled();
      expect(result).toEqual({ favorited: true, productId: 1 });
    });

    it('quita el producto de favoritos si ya existía', async () => {
      prisma.favorite.findUnique.mockResolvedValue({ id: 5, userId: 1, productId: 1 });
      prisma.favorite.delete.mockResolvedValue({ id: 5 });

      const result = await service.toggleFavorite(1, 1);

      expect(prisma.favorite.delete).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(prisma.favorite.create).not.toHaveBeenCalled();
      expect(result).toEqual({ favorited: false, productId: 1 });
    });

    it('consulta el favorito existente usando la clave compuesta userId_productId', async () => {
      prisma.favorite.findUnique.mockResolvedValue(null);
      prisma.favorite.create.mockResolvedValue({});

      await service.toggleFavorite(2, 7);

      expect(prisma.favorite.findUnique).toHaveBeenCalledWith({
        where: { userId_productId: { userId: 2, productId: 7 } },
      });
    });
  });

  // ── getUserFavorites ─────────────────────────────────────────────────────────

  describe('getUserFavorites', () => {
    it('retorna los productos favoritos del usuario', async () => {
      prisma.favorite.findMany.mockResolvedValue([
        { id: 1, userId: 1, productId: 1, product: mockProduct },
      ]);

      const result = await service.getUserFavorites(1);

      expect(prisma.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { product: true },
      });
      expect(result).toEqual([mockProduct]);
    });

    it('retorna arreglo vacío si el usuario no tiene favoritos', async () => {
      prisma.favorite.findMany.mockResolvedValue([]);

      const result = await service.getUserFavorites(99);

      expect(result).toEqual([]);
    });
  });

  // ── getFavoriteIds ───────────────────────────────────────────────────────────

  describe('getFavoriteIds', () => {
    it('retorna solo los ids de los productos favoritos', async () => {
      prisma.favorite.findMany.mockResolvedValue([
        { productId: 1 },
        { productId: 7 },
      ]);

      const result = await service.getFavoriteIds(1);

      expect(prisma.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        select: { productId: true },
      });
      expect(result).toEqual([1, 7]);
    });

    it('retorna arreglo vacío si no hay favoritos', async () => {
      prisma.favorite.findMany.mockResolvedValue([]);

      const result = await service.getFavoriteIds(1);

      expect(result).toEqual([]);
    });
  });
});
