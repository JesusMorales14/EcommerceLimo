import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReclamacionesService } from './reclamaciones.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const mockReclamacion = {
  id: 1,
  nombre: 'Ana',
  apellidos: 'Pérez',
  dni: '12345678',
  email: 'ana@test.com',
  telefono: '999999999',
  direccion: null,
  tipo: 'RECLAMO',
  bien: 'PRODUCTO',
  pedidoNum: null,
  detalle: 'Producto llegó defectuoso',
  accion: null,
  estado: 'PENDIENTE',
  respuesta: null,
  userId: null,
  createdAt: new Date(),
};

describe('ReclamacionesService', () => {
  let service: ReclamacionesService;
  let prisma: any;
  let mail: any;

  beforeEach(async () => {
    prisma = {
      reclamacion: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    mail = {
      sendReclamacionAdmin: jest.fn().mockResolvedValue(undefined),
      sendReclamacionRespuesta: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReclamacionesService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: mail },
      ],
    }).compile();

    service = module.get<ReclamacionesService>(ReclamacionesService);
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
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

    it('crea la reclamación asociando el userId cuando se proporciona', async () => {
      prisma.reclamacion.create.mockResolvedValue(mockReclamacion);

      const result = await service.create(dto, 5);

      expect(prisma.reclamacion.create).toHaveBeenCalledWith({
        data: { ...dto, userId: 5 },
      });
      expect(result).toEqual(mockReclamacion);
    });

    it('crea la reclamación con userId null si no se proporciona (usuario anónimo)', async () => {
      prisma.reclamacion.create.mockResolvedValue(mockReclamacion);

      await service.create(dto);

      expect(prisma.reclamacion.create).toHaveBeenCalledWith({
        data: { ...dto, userId: null },
      });
    });

    it('envía notificación al admin tras crear la reclamación', async () => {
      prisma.reclamacion.create.mockResolvedValue(mockReclamacion);

      await service.create(dto, 5);

      expect(mail.sendReclamacionAdmin).toHaveBeenCalledWith(mockReclamacion);
    });

    it('retorna la reclamación creada aunque el envío de correo falle', async () => {
      prisma.reclamacion.create.mockResolvedValue(mockReclamacion);
      mail.sendReclamacionAdmin.mockRejectedValue(new Error('SMTP caído'));

      const result = await service.create(dto, 5);

      expect(result).toEqual(mockReclamacion);
    });
  });

  // ── findAll ──────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('retorna todas las reclamaciones incluyendo datos del usuario', async () => {
      prisma.reclamacion.findMany.mockResolvedValue([mockReclamacion]);

      const result = await service.findAll();

      expect(prisma.reclamacion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result).toEqual([mockReclamacion]);
    });
  });

  // ── findByUser ───────────────────────────────────────────────────────────────

  describe('findByUser', () => {
    it('retorna las reclamaciones del usuario indicado', async () => {
      prisma.reclamacion.findMany.mockResolvedValue([mockReclamacion]);

      const result = await service.findByUser(5);

      expect(prisma.reclamacion.findMany).toHaveBeenCalledWith({
        where: { userId: 5 },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockReclamacion]);
    });

    it('retorna arreglo vacío si el usuario no tiene reclamaciones', async () => {
      prisma.reclamacion.findMany.mockResolvedValue([]);

      const result = await service.findByUser(99);

      expect(result).toEqual([]);
    });
  });

  // ── updateEstado ─────────────────────────────────────────────────────────────

  describe('updateEstado', () => {
    it('actualiza el estado y la respuesta, y notifica al usuario', async () => {
      prisma.reclamacion.findUnique.mockResolvedValue(mockReclamacion);
      const updated = {
        ...mockReclamacion,
        estado: 'RESUELTO',
        respuesta: 'Listo',
      };
      prisma.reclamacion.update.mockResolvedValue(updated);

      const result = await service.updateEstado(1, {
        estado: 'RESUELTO' as any,
        respuesta: 'Listo',
      });

      expect(prisma.reclamacion.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { estado: 'RESUELTO', respuesta: 'Listo' },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      expect(mail.sendReclamacionRespuesta).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('conserva la respuesta existente si no se envía una nueva', async () => {
      prisma.reclamacion.findUnique.mockResolvedValue({
        ...mockReclamacion,
        respuesta: 'Respuesta previa',
      });
      prisma.reclamacion.update.mockResolvedValue(mockReclamacion);

      await service.updateEstado(1, { estado: 'EN_REVISION' as any });

      expect(prisma.reclamacion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { estado: 'EN_REVISION', respuesta: 'Respuesta previa' },
        }),
      );
    });

    it('lanza NotFoundException si la reclamación no existe', async () => {
      prisma.reclamacion.findUnique.mockResolvedValue(null);

      await expect(
        service.updateEstado(999, { estado: 'RESUELTO' as any }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.reclamacion.update).not.toHaveBeenCalled();
    });
  });
});
