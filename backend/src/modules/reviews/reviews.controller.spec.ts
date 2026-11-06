import { ReviewsController } from './reviews.controller';
import type { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  const service = {
    getByProduct: jest.fn(),
    getStats: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };
  const controller = new ReviewsController(
    service as unknown as ReviewsService,
  );
  const user = { id: 1, email: 'a@a.com', role: 'USER' as const };

  it('delega en el servicio con el usuario autenticado', () => {
    controller.getByProduct(3);
    controller.getStats(3);
    controller.create(user, 3, { rating: 4, comment: 'Bien' });
    controller.remove(user, 8);
    expect(service.getByProduct).toHaveBeenCalledWith(3);
    expect(service.getStats).toHaveBeenCalledWith(3);
    expect(service.create).toHaveBeenCalledWith(1, 3, {
      rating: 4,
      comment: 'Bien',
    });
    expect(service.remove).toHaveBeenCalledWith(user, 8);
  });
});
