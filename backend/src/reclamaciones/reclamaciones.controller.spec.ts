import { Test, TestingModule } from '@nestjs/testing';
import { ReclamacionesController } from './reclamaciones.controller';
import { ReclamacionesService } from './reclamaciones.service';

describe('ReclamacionesController', () => {
  let controller: ReclamacionesController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findByUser: jest.fn(),
      findAll: jest.fn(),
      updateEstado: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReclamacionesController],
      providers: [{ provide: ReclamacionesService, useValue: service }],
    }).compile();

    controller = module.get<ReclamacionesController>(ReclamacionesController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  const dto = {
    nombre: 'Ana',
    apellidos: 'Pérez',
    dni: '12345678',
    email: 'ana@test.com',
    telefono: '999999999',
    tipo: 'RECLAMO' as any,
    bien: 'PRODUCTO' as any,
    detalle: 'Producto llegó defectuoso',
  };

  describe('create', () => {
    it('delega en el service con el userId del usuario autenticado si existe', () => {
      service.create.mockReturnValue({ id: 1, ...dto });

      const result = controller.create(dto, { user: { id: 5 } });

      expect(service.create).toHaveBeenCalledWith(dto, 5);
      expect(result).toEqual({ id: 1, ...dto });
    });

    it('delega en el service con userId undefined si no hay usuario autenticado', () => {
      service.create.mockReturnValue({ id: 1, ...dto });

      controller.create(dto, {});

      expect(service.create).toHaveBeenCalledWith(dto, undefined);
    });
  });

  describe('mine', () => {
    it('delega en findByUser usando el id del usuario autenticado', () => {
      service.findByUser.mockReturnValue([{ id: 1 }]);

      const result = controller.mine({ user: { id: 5 } });

      expect(service.findByUser).toHaveBeenCalledWith(5);
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('all', () => {
    it('delega en findAll', () => {
      service.findAll.mockReturnValue([{ id: 1 }, { id: 2 }]);

      const result = controller.all();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('updateEstado', () => {
    it('delega en el service convirtiendo el id a número', () => {
      const updateDto = { estado: 'RESUELTO' as any, respuesta: 'Listo' };
      service.updateEstado.mockReturnValue({ id: 1, ...updateDto });

      const result = controller.updateEstado('1', updateDto);

      expect(service.updateEstado).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual({ id: 1, ...updateDto });
    });
  });
});
