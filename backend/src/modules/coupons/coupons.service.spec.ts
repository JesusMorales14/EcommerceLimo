import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { CouponsRepository } from './coupons.repository';
import { CouponsService } from './coupons.service';

const COUPON = {
  id: 1,
  code: 'DESC10',
  discount: 10,
  isPercent: true,
  minAmount: 0,
  maxUses: 5,
  usedCount: 0,
  active: true,
  expiresAt: null,
  createdAt: new Date(),
};
const tx = {} as Prisma.TransactionClient;

describe('CouponsService', () => {
  const repo = {
    findByCode: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    setActive: jest.fn(),
    delete: jest.fn(),
    redeem: jest.fn(),
  };
  const service = new CouponsService(repo as unknown as CouponsRepository);

  beforeEach(() => jest.clearAllMocks());

  describe('quote', () => {
    it('calcula el descuento de un cupón válido', async () => {
      repo.findByCode.mockResolvedValue(COUPON);
      await expect(service.quote('desc10', 200)).resolves.toMatchObject({
        id: 1,
        discountAmount: 20,
        finalAmount: 180,
      });
    });

    it('lanza NotFound si no existe', async () => {
      repo.findByCode.mockResolvedValue(null);
      await expect(service.quote('X', 10)).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequest con el motivo del rechazo', async () => {
      repo.findByCode.mockResolvedValue({ ...COUPON, minAmount: 500 });
      await expect(service.quote('DESC10', 100)).rejects.toThrow(
        'Monto mínimo para este cupón: S/ 500.00',
      );
    });
  });

  it('redeem falla si el cupón se agotó en paralelo', async () => {
    repo.redeem.mockResolvedValue(false);
    await expect(service.redeem(1, tx)).rejects.toThrow(BadRequestException);
    repo.redeem.mockResolvedValue(true);
    await expect(service.redeem(1, tx)).resolves.toBeUndefined();
  });

  it('create convierte la fecha de expiración', async () => {
    await service.create({
      code: 'NUEVO',
      discount: 5,
      isPercent: true,
      minAmount: 0,
      maxUses: 1,
      expiresAt: '2030-01-01T00:00:00.000Z',
    });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      }),
    );
  });

  it('toggle invierte el estado y remove valida la existencia', async () => {
    repo.findById.mockResolvedValue(COUPON);
    await service.toggle(1);
    expect(repo.setActive).toHaveBeenCalledWith(1, false);

    repo.findById.mockResolvedValue(null);
    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });

  it('findAll delega en el repositorio', async () => {
    repo.findAll.mockResolvedValue([COUPON]);
    await expect(service.findAll()).resolves.toHaveLength(1);
  });
});
