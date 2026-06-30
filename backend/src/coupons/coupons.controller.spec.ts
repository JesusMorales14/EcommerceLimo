import { Test, TestingModule } from '@nestjs/testing';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';

describe('CouponsController', () => {
  let controller: CouponsController;
  let service: any;

  beforeEach(async () => {
    service = {
      validate: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      toggle: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponsController],
      providers: [{ provide: CouponsService, useValue: service }],
    }).compile();

    controller = module.get<CouponsController>(CouponsController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('validate', () => {
    it('delega en el service convirtiendo amount a número', () => {
      service.validate.mockReturnValue({ finalAmount: 80 });

      const result = controller.validate('DESCUENTO20', '100');

      expect(service.validate).toHaveBeenCalledWith('DESCUENTO20', 100);
      expect(result).toEqual({ finalAmount: 80 });
    });
  });

  describe('findAll', () => {
    it('delega en el service', () => {
      service.findAll.mockReturnValue([{ id: 1 }]);

      const result = controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('create', () => {
    it('delega en el service con el body recibido', () => {
      const body = {
        code: 'NUEVO10',
        discount: 10,
        isPercent: true,
        minAmount: 0,
        maxUses: 5,
      };
      service.create.mockReturnValue({ id: 2, ...body });

      const result = controller.create(body);

      expect(service.create).toHaveBeenCalledWith(body);
      expect(result).toEqual({ id: 2, ...body });
    });
  });

  describe('toggle', () => {
    it('delega en el service convirtiendo id a número', () => {
      service.toggle.mockReturnValue({ id: 1, active: false });

      const result = controller.toggle('1');

      expect(service.toggle).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, active: false });
    });
  });

  describe('remove', () => {
    it('delega en el service convirtiendo id a número', () => {
      service.remove.mockReturnValue({ id: 1 });

      const result = controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });
  });
});
