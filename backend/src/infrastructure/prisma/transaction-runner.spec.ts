import type { PrismaService } from './prisma.service';
import { TransactionRunner } from './transaction-runner';

describe('TransactionRunner', () => {
  it('ejecuta el trabajo dentro de una transacción de Prisma', async () => {
    const tx = { marker: 'tx' };
    const prisma = {
      $transaction: jest.fn((work: (client: unknown) => Promise<unknown>) =>
        work(tx),
      ),
    } as unknown as PrismaService;

    const result = await new TransactionRunner(prisma).run((client) =>
      Promise.resolve(client),
    );

    expect(result).toBe(tx);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
