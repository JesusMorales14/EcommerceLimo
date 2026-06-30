import { Test, TestingModule } from '@nestjs/testing';
import { DealSessionsController } from './deal-sessions.controller';
import { DealSessionsService } from './deal-sessions.service';

describe('DealSessionsController', () => {
  let controller: DealSessionsController;
  let service: any;

  beforeEach(async () => {
    service = {
      getActive: jest.fn(),
      getScheduled: jest.fn(),
      create: jest.fn(),
      cancel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DealSessionsController],
      providers: [{ provide: DealSessionsService, useValue: service }],
    }).compile();

    controller = module.get<DealSessionsController>(DealSessionsController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getActive', () => {
    it('delega en el service', () => {
      service.getActive.mockReturnValue({ id: 1 });

      const result = controller.getActive();

      expect(service.getActive).toHaveBeenCalled();
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('getScheduled', () => {
    it('delega en el service', () => {
      service.getScheduled.mockReturnValue(null);

      const result = controller.getScheduled();

      expect(service.getScheduled).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('convierte endsAt y startsAt en fechas antes de delegar', () => {
      service.create.mockReturnValue({ id: 1 });

      controller.create('2030-01-01T00:00:00.000Z', '2029-12-31T00:00:00.000Z');

      expect(service.create).toHaveBeenCalledWith(
        new Date('2030-01-01T00:00:00.000Z'),
        new Date('2029-12-31T00:00:00.000Z'),
      );
    });

    it('pasa startsAt undefined si no se proporciona', () => {
      service.create.mockReturnValue({ id: 1 });

      controller.create('2030-01-01T00:00:00.000Z');

      expect(service.create).toHaveBeenCalledWith(
        new Date('2030-01-01T00:00:00.000Z'),
        undefined,
      );
    });
  });

  describe('cancel', () => {
    it('delega en el service', () => {
      service.cancel.mockReturnValue({ ok: true });

      const result = controller.cancel();

      expect(service.cancel).toHaveBeenCalled();
      expect(result).toEqual({ ok: true });
    });
  });
});
