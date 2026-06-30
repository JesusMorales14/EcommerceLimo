import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { PrismaService } from '../prisma/prisma.service';

const mockCoupon = {
  id: 1,
  code: 'DESCUENTO20',
  discount: 20,
  isPercent: true,
  minAmount: 100,
  maxUses: 10,
  usedCount: 2,
  active: true,
  expiresAt: null,
  createdAt: new Date(),
};

describe('CouponsService', () => {
  let service: CouponsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      coupon: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
  });

  // ── validate ─────────────────────────────────────────────────────────────────

  describe('validate', () => {
    it('valida un cupón porcentual y calcula el descuento correctamente', async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);

      const result = await service.validate('descuento20', 200);

      expect(prisma.coupon.findUnique).toHaveBeenCalledWith({
        where: { code: 'DESCUENTO20' },
      });
      expect(result.discountAmount).toBe(40);
      expect(result.finalAmount).toBe(160);
      expect(result.isPercent).toBe(true);
    });

    it('valida un cupón de monto fijo y lo resta del total', async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        isPercent: false,
        discount: 30,
      });

      const result = await service.validate('DESCUENTO20', 200);

      expect(result.discountAmount).toBe(30);
      expect(result.finalAmount).toBe(170);
    });

    it('limita el descuento de monto fijo al total de la compra (no queda negativo)', async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        isPercent: false,
        discount: 500,
        minAmount: 50,
      });

      const result = await service.validate('DESCUENTO20', 200);

      expect(result.discountAmount).toBe(200);
      expect(result.finalAmount).toBe(0);
    });

    it('lanza NotFoundException si el cupón no existe', async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);

      await expect(service.validate('NOEXISTE', 200)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza BadRequestException si el cupón está inactivo', async () => {
      prisma.coupon.findUnique.mockResolvedValue({ ...mockCoupon, active: false });

      await expect(service.validate('DESCUENTO20', 200)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si el cupón está expirado', async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        expiresAt: new Date('2000-01-01'),
      });

      await expect(service.validate('DESCUENTO20', 200)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si el cupón está agotado', async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        ...mockCoupon,
        usedCount: 10,
        maxUses: 10,
      });

      await expect(service.validate('DESCUENTO20', 200)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si el monto no alcanza el mínimo', async () => {
      prisma.coupon.findUnique.mockResolvedValue({ ...mockCoupon, minAmount: 500 });

      await expect(service.validate('DESCUENTO20', 200)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── use ──────────────────────────────────────────────────────────────────────

  describe('use', () => {
    it('incrementa el contador de usos del cupón', async () => {
      prisma.coupon.update.mockResolvedValue({});

      await service.use('descuento20');

      expect(prisma.coupon.update).toHaveBeenCalledWith({
        where: { code: 'DESCUENTO20' },
        data: { usedCount: { increment: 1 } },
      });
    });
  });

  // ── findAll ──────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('retorna todos los cupones ordenados por fecha de creación descendente', async () => {
      prisma.coupon.findMany.mockResolvedValue([mockCoupon]);

      const result = await service.findAll();

      expect(result).toEqual([mockCoupon]);
      expect(prisma.coupon.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('crea un cupón normalizando el código a mayúsculas', async () => {
      prisma.coupon.create.mockResolvedValue(mockCoupon);

      const result = await service.create({
        code: 'descuento20',
        discount: 20,
        isPercent: true,
        minAmount: 100,
        maxUses: 10,
      });

      expect(prisma.coupon.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ code: 'DESCUENTO20', expiresAt: null }),
      });
      expect(result).toEqual(mockCoupon);
    });

    it('convierte expiresAt en una fecha cuando se proporciona', async () => {
      prisma.coupon.create.mockResolvedValue(mockCoupon);

      await service.create({
        code: 'TEMP10',
        discount: 10,
        isPercent: true,
        minAmount: 0,
        maxUses: 1,
        expiresAt: '2030-01-01',
      });

      expect(prisma.coupon.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ expiresAt: new Date('2030-01-01') }),
      });
    });
  });

  // ── toggle ───────────────────────────────────────────────────────────────────

  describe('toggle', () => {
    it('invierte el estado activo del cupón', async () => {
      prisma.coupon.findUnique.mockResolvedValue(mockCoupon);
      prisma.coupon.update.mockResolvedValue({ ...mockCoupon, active: false });

      const result = await service.toggle(1);

      expect(prisma.coupon.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: false },
      });
      expect(result.active).toBe(false);
    });

    it('lanza NotFoundException si el cupón no existe', async () => {
      prisma.coupon.findUnique.mockResolvedValue(null);

      await expect(service.toggle(999)).rejects.toThrow(NotFoundException);
      expect(prisma.coupon.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('elimina el cupón indicado', async () => {
      prisma.coupon.delete.mockResolvedValue(mockCoupon);

      const result = await service.remove(1);

      expect(prisma.coupon.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockCoupon);
    });
  });
});
