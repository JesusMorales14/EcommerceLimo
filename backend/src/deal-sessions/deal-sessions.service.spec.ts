import { Test, TestingModule } from '@nestjs/testing';
import { DealSessionsService } from './deal-sessions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DealSessionsService', () => {
  let service: DealSessionsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      dealSession: {
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DealSessionsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<DealSessionsService>(DealSessionsService);
  });

  // ── getActive ────────────────────────────────────────────────────────────────

  describe('getActive', () => {
    it('retorna null si no hay ninguna sesión activa', async () => {
      prisma.dealSession.findFirst.mockResolvedValue(null);

      const result = await service.getActive();

      expect(result).toBeNull();
    });

    it('retorna la sesión activa vigente', async () => {
      const session = {
        id: 1,
        active: true,
        startsAt: new Date(Date.now() - 1000),
        endsAt: new Date(Date.now() + 1000 * 60 * 60),
      };
      prisma.dealSession.findFirst.mockResolvedValue(session);

      const result = await service.getActive();

      expect(result).toEqual(session);
      expect(prisma.dealSession.update).not.toHaveBeenCalled();
    });

    it('desactiva y retorna null si la sesión activa ya expiró', async () => {
      const session = {
        id: 1,
        active: true,
        startsAt: new Date(Date.now() - 1000 * 60 * 60),
        endsAt: new Date(Date.now() - 1000),
      };
      prisma.dealSession.findFirst.mockResolvedValue(session);
      prisma.dealSession.update.mockResolvedValue({ ...session, active: false });

      const result = await service.getActive();

      expect(prisma.dealSession.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: false },
      });
      expect(result).toBeNull();
    });
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('desactiva cualquier sesión activa previa y crea una nueva', async () => {
      const endsAt = new Date(Date.now() + 1000 * 60 * 60);
      prisma.dealSession.updateMany.mockResolvedValue({ count: 1 });
      prisma.dealSession.create.mockResolvedValue({ id: 2, endsAt, active: true });

      const result = await service.create(endsAt);

      expect(prisma.dealSession.updateMany).toHaveBeenCalledWith({
        where: { active: true },
        data: { active: false },
      });
      expect(prisma.dealSession.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ endsAt, active: true }),
      });
      expect(result.id).toBe(2);
    });

    it('usa startsAt proporcionado en vez de la fecha actual', async () => {
      const endsAt = new Date(Date.now() + 1000 * 60 * 60);
      const startsAt = new Date(Date.now() + 1000 * 60);
      prisma.dealSession.updateMany.mockResolvedValue({ count: 0 });
      prisma.dealSession.create.mockResolvedValue({ id: 3, endsAt, startsAt, active: true });

      await service.create(endsAt, startsAt);

      expect(prisma.dealSession.create).toHaveBeenCalledWith({
        data: { endsAt, startsAt, active: true },
      });
    });
  });

  // ── getScheduled ─────────────────────────────────────────────────────────────

  describe('getScheduled', () => {
    it('retorna la próxima sesión programada (aún no iniciada)', async () => {
      const session = {
        id: 4,
        active: true,
        startsAt: new Date(Date.now() + 1000 * 60),
        endsAt: new Date(Date.now() + 1000 * 60 * 60),
      };
      prisma.dealSession.findFirst.mockResolvedValue(session);

      const result = await service.getScheduled();

      expect(result).toEqual(session);
      expect(prisma.dealSession.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { startsAt: 'asc' } }),
      );
    });

    it('retorna null si no hay sesiones programadas', async () => {
      prisma.dealSession.findFirst.mockResolvedValue(null);

      const result = await service.getScheduled();

      expect(result).toBeNull();
    });
  });

  // ── cancel ───────────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('desactiva todas las sesiones activas y retorna ok true', async () => {
      prisma.dealSession.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.cancel();

      expect(prisma.dealSession.updateMany).toHaveBeenCalledWith({
        where: { active: true },
        data: { active: false },
      });
      expect(result).toEqual({ ok: true });
    });
  });
});
