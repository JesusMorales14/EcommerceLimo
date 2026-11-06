import { BadRequestException } from '@nestjs/common';
import type { TransactionRunner } from '../../infrastructure/prisma/transaction-runner';
import type { DealSessionsRepository } from './deal-sessions.repository';
import { DealSessionsService } from './deal-sessions.service';

const NOW = new Date('2026-06-01T12:00:00Z');
const hours = (h: number) => new Date(NOW.getTime() + h * 3_600_000);

describe('DealSessionsService', () => {
  const repo = {
    findLatestStarted: jest.fn(),
    findNextScheduled: jest.fn(),
    deactivate: jest.fn(),
    deactivateAll: jest.fn(),
    create: jest.fn(),
  };
  const tx = {};
  const transactions = {
    run: jest.fn((work: (t: unknown) => unknown) => work(tx)),
  };
  const service = new DealSessionsService(
    repo as unknown as DealSessionsRepository,
    transactions as unknown as TransactionRunner,
  );

  beforeEach(() => jest.clearAllMocks());

  it('getActive devuelve la sesión vigente', async () => {
    const session = { id: 1, endsAt: hours(2) };
    repo.findLatestStarted.mockResolvedValue(session);
    await expect(service.getActive(NOW)).resolves.toBe(session);
  });

  it('getActive desactiva la sesión vencida', async () => {
    repo.findLatestStarted.mockResolvedValue({ id: 1, endsAt: hours(-1) });
    await expect(service.getActive(NOW)).resolves.toBeNull();
    expect(repo.deactivate).toHaveBeenCalledWith(1);
  });

  it('getActive devuelve null si no hay sesión', async () => {
    repo.findLatestStarted.mockResolvedValue(null);
    await expect(service.getActive(NOW)).resolves.toBeNull();
  });

  it('create valida el rango y reemplaza la sesión vigente en una transacción', async () => {
    await expect(
      service.create({ endsAt: hours(-1).toISOString() }, NOW),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.create(
        { endsAt: hours(1).toISOString(), startsAt: hours(2).toISOString() },
        NOW,
      ),
    ).rejects.toThrow('anterior');

    await service.create({ endsAt: hours(3).toISOString() }, NOW);
    expect(repo.deactivateAll).toHaveBeenCalledWith(tx);
    expect(repo.create).toHaveBeenCalledWith(
      { startsAt: NOW, endsAt: hours(3), active: true },
      tx,
    );
  });

  it('cancel desactiva todo y getScheduled delega', async () => {
    await expect(service.cancel()).resolves.toEqual({ ok: true });
    repo.findNextScheduled.mockResolvedValue(null);
    await expect(service.getScheduled(NOW)).resolves.toBeNull();
  });
});
