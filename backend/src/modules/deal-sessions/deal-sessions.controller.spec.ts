import { DealSessionsController } from './deal-sessions.controller';
import type { DealSessionsService } from './deal-sessions.service';

describe('DealSessionsController', () => {
  const service = {
    getActive: jest.fn(),
    getScheduled: jest.fn(),
    create: jest.fn(),
    cancel: jest.fn(),
  };
  const controller = new DealSessionsController(
    service as unknown as DealSessionsService,
  );

  it('delega en el servicio', () => {
    controller.getActive();
    controller.getScheduled();
    controller.create({ endsAt: '2030-01-01T00:00:00Z' });
    controller.cancel();
    expect(service.getActive).toHaveBeenCalled();
    expect(service.getScheduled).toHaveBeenCalled();
    expect(service.create).toHaveBeenCalledWith({
      endsAt: '2030-01-01T00:00:00Z',
    });
    expect(service.cancel).toHaveBeenCalled();
  });
});
