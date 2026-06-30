import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';

const mockReview = {
  id: 1,
  userId: 1,
  productId: 1,
  rating: 5,
  comment: 'Excelente producto',
  createdAt: new Date(),
  user: { id: 1, name: 'Ana García' },
};

const mockProduct = { id: 1, name: 'Producto Test' };

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      review: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  // ── getByProduct ──────────────────────────────────────────────────────────────

  describe('getByProduct', () => {
    it('retorna las reseñas del producto ordenadas por fecha', async () => {
      prisma.review.findMany.mockResolvedValue([mockReview]);

      const result = await service.getByProduct(1);

      expect(result).toEqual([mockReview]);
      expect(prisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { productId: 1 } }),
      );
    });

    it('retorna arreglo vacío si el producto no tiene reseñas', async () => {
      prisma.review.findMany.mockResolvedValue([]);
      const result = await service.getByProduct(99);
      expect(result).toHaveLength(0);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('crea una reseña correctamente', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findFirst.mockResolvedValue(null);
      prisma.review.create.mockResolvedValue(mockReview);

      const result = await service.create(1, 1, 5, 'Excelente');

      expect(result).toEqual(mockReview);
      expect(prisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { userId: 1, productId: 1, rating: 5, comment: 'Excelente' },
        }),
      );
    });

    it('lanza BadRequestException si el rating es menor a 1', async () => {
      await expect(service.create(1, 1, 0, 'Malo')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si el rating es mayor a 5', async () => {
      await expect(service.create(1, 1, 6, 'Muy bueno')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza NotFoundException si el producto no existe', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      await expect(service.create(1, 99, 5, 'Ok')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza BadRequestException si el usuario ya reseñó ese producto', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.review.findFirst.mockResolvedValue(mockReview);

      await expect(service.create(1, 1, 4, 'Segunda reseña')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('no llama a create si la validación de rating falla', async () => {
      await expect(service.create(1, 1, -1, 'Test')).rejects.toThrow();
      expect(prisma.review.create).not.toHaveBeenCalled();
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('el propietario puede eliminar su reseña', async () => {
      prisma.review.findUnique.mockResolvedValue(mockReview);
      prisma.review.delete.mockResolvedValue(mockReview);

      const result = await service.remove(1, 1, false);

      expect(result).toEqual(mockReview);
      expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('un admin puede eliminar cualquier reseña', async () => {
      prisma.review.findUnique.mockResolvedValue({ ...mockReview, userId: 5 });
      prisma.review.delete.mockResolvedValue(mockReview);

      const result = await service.remove(1, 1, true);

      expect(result).toEqual(mockReview);
    });

    it('lanza NotFoundException si la reseña no existe', async () => {
      prisma.review.findUnique.mockResolvedValue(null);
      await expect(service.remove(1, 99, false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza BadRequestException si un usuario intenta eliminar la reseña de otro', async () => {
      prisma.review.findUnique.mockResolvedValue({ ...mockReview, userId: 5 });
      await expect(service.remove(1, 1, false)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('no llama a delete si la reseña no existe', async () => {
      prisma.review.findUnique.mockResolvedValue(null);
      await expect(service.remove(1, 99, false)).rejects.toThrow();
      expect(prisma.review.delete).not.toHaveBeenCalled();
    });
  });

  // ── getStats ──────────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('retorna promedio, total y distribución correctos', async () => {
      prisma.review.findMany.mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
      ]);

      const result = await service.getStats(1);

      expect(result.total).toBe(3);
      expect(result.average).toBe(4.7);
      expect(result.distribution[5]).toBe(2);
      expect(result.distribution[4]).toBe(1);
    });

    it('retorna average 0 y total 0 si no hay reseñas', async () => {
      prisma.review.findMany.mockResolvedValue([]);
      const result = await service.getStats(1);
      expect(result).toEqual({ average: 0, total: 0, distribution: {} });
    });

    it('retorna distribución con todos los ratings del 1 al 5 inicializados', async () => {
      prisma.review.findMany.mockResolvedValue([{ rating: 3 }]);
      const result = await service.getStats(1);
      expect(result.distribution).toMatchObject({
        1: 0,
        2: 0,
        3: 1,
        4: 0,
        5: 0,
      });
    });
  });
});
