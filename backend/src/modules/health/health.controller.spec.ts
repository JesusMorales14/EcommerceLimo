import { ServiceUnavailableException } from '@nestjs/common';
import type { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const prisma = { $queryRaw: jest.fn() };
  const controller = new HealthController(prisma as unknown as PrismaService);

  it('live responde ok', () => {
    expect(controller.live().status).toBe('ok');
  });

  it('ready verifica la base de datos', async () => {
    prisma.$queryRaw.mockResolvedValue([1]);
    await expect(controller.ready()).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
    prisma.$queryRaw.mockRejectedValue(new Error('down'));
    await expect(controller.ready()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
