import { NotFoundException } from '@nestjs/common';
import type { MailService } from '../../infrastructure/mail/mail.service';
import type { CreateReclamacionDto } from './dto/create-reclamacion.dto';
import type { ReclamacionesRepository } from './reclamaciones.repository';
import { ReclamacionesService } from './reclamaciones.service';

const DTO = {
  nombre: 'Ana',
  apellidos: 'Pérez',
  dni: '12345678',
  email: 'a@a.com',
  telefono: '999999999',
  tipo: 'RECLAMO',
  bien: 'PRODUCTO',
  detalle: 'Producto dañado al llegar',
} as CreateReclamacionDto;

describe('ReclamacionesService', () => {
  const repo = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findByUser: jest.fn(),
    update: jest.fn(),
  };
  const mail = {
    sendNewClaimToAdmin: jest.fn().mockResolvedValue(undefined),
    sendClaimResponse: jest.fn().mockResolvedValue(undefined),
  };
  const service = new ReclamacionesService(
    repo as unknown as ReclamacionesRepository,
    mail as unknown as MailService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('create guarda el usuario (o null si es anónimo) y avisa al admin', async () => {
    repo.create.mockResolvedValue({ id: 1 });
    await service.create(DTO);
    expect(repo.create).toHaveBeenCalledWith({ ...DTO, userId: null });
    await service.create(DTO, 7);
    expect(repo.create).toHaveBeenLastCalledWith({ ...DTO, userId: 7 });
    expect(mail.sendNewClaimToAdmin).toHaveBeenCalledTimes(2);
  });

  it('create no falla si el correo falla', async () => {
    repo.create.mockResolvedValue({ id: 1 });
    mail.sendNewClaimToAdmin.mockRejectedValueOnce(new Error('SMTP'));
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
    await expect(service.create(DTO)).resolves.toEqual({ id: 1 });
  });

  it('updateStatus valida existencia, actualiza y notifica', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      service.updateStatus(1, { estado: 'RESUELTO' }),
    ).rejects.toThrow(NotFoundException);

    repo.findById.mockResolvedValue({ id: 1 });
    repo.update.mockResolvedValue({ id: 1, estado: 'RESUELTO' });
    await service.updateStatus(1, { estado: 'RESUELTO', respuesta: ' Hecho ' });
    expect(repo.update).toHaveBeenCalledWith(1, {
      estado: 'RESUELTO',
      respuesta: 'Hecho',
    });
    expect(mail.sendClaimResponse).toHaveBeenCalled();
  });

  it('consultas delegan en el repositorio', async () => {
    repo.findAll.mockResolvedValue([]);
    repo.findByUser.mockResolvedValue([]);
    await expect(service.findAll()).resolves.toEqual([]);
    await expect(service.findByUser(1)).resolves.toEqual([]);
  });
});
