import type { CreateReclamacionDto } from './dto/create-reclamacion.dto';
import { ReclamacionesController } from './reclamaciones.controller';
import type { ReclamacionesService } from './reclamaciones.service';

describe('ReclamacionesController', () => {
  const service = {
    create: jest.fn(),
    findByUser: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
  };
  const controller = new ReclamacionesController(
    service as unknown as ReclamacionesService,
  );
  const dto = { nombre: 'Ana' } as CreateReclamacionDto;

  it('permite registrar reclamaciones anónimas o autenticadas', () => {
    controller.create(dto);
    controller.create(dto, { id: 4, email: 'a@a.com', role: 'USER' });
    expect(service.create).toHaveBeenNthCalledWith(1, dto, undefined);
    expect(service.create).toHaveBeenNthCalledWith(2, dto, 4);
  });

  it('delega consultas y actualizaciones', () => {
    controller.mine({ id: 4, email: 'a@a.com', role: 'USER' });
    controller.all();
    controller.updateStatus(2, { estado: 'CERRADO' });
    expect(service.findByUser).toHaveBeenCalledWith(4);
    expect(service.findAll).toHaveBeenCalled();
    expect(service.updateStatus).toHaveBeenCalledWith(2, { estado: 'CERRADO' });
  });
});
