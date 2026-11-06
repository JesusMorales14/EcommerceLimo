import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  const repo = {
    findByProduct: jest.fn(),
    findById: jest.fn(),
    findByUserAndProduct: jest.fn(),
    productExists: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    countByRating: jest.fn(),
  };
  const service = new ReviewsService(repo as unknown as ReviewsRepository);
  const dto = { rating: 5, comment: 'Muy bueno' };
  const user = { id: 1, email: 'a@a.com', role: 'USER' as const };

  beforeEach(() => jest.clearAllMocks());

  it('create valida producto existente y una reseña por usuario', async () => {
    repo.productExists.mockResolvedValue(false);
    await expect(service.create(1, 2, dto)).rejects.toThrow(NotFoundException);

    repo.productExists.mockResolvedValue(true);
    repo.findByUserAndProduct.mockResolvedValue({ id: 3 });
    await expect(service.create(1, 2, dto)).rejects.toThrow(ConflictException);

    repo.findByUserAndProduct.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: 4 });
    await expect(service.create(1, 2, dto)).resolves.toEqual({ id: 4 });
    expect(repo.create).toHaveBeenCalledWith({
      userId: 1,
      productId: 2,
      rating: 5,
      comment: 'Muy bueno',
    });
  });

  it('remove solo permite al autor o a un administrador', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.remove(user, 1)).rejects.toThrow(NotFoundException);

    repo.findById.mockResolvedValue({ id: 1, userId: 99 });
    await expect(service.remove(user, 1)).rejects.toThrow(ForbiddenException);
    await expect(
      service.remove({ ...user, role: 'ADMIN' }, 1),
    ).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it('getStats agrega el conteo por puntuación', async () => {
    repo.countByRating.mockResolvedValue([{ rating: 4, count: 2 }]);
    await expect(service.getStats(1)).resolves.toMatchObject({
      average: 4,
      total: 2,
    });
  });

  it('getByProduct delega en el repositorio', async () => {
    repo.findByProduct.mockResolvedValue([]);
    await expect(service.getByProduct(1)).resolves.toEqual([]);
  });
});
