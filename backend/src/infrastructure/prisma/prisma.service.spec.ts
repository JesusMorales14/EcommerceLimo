import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('abre y cierra la conexión según el ciclo de vida del módulo', async () => {
    const service = Object.create(PrismaService.prototype) as PrismaService;
    const connect = jest.fn().mockResolvedValue(undefined);
    const disconnect = jest.fn().mockResolvedValue(undefined);
    Object.assign(service, { $connect: connect, $disconnect: disconnect });

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(connect).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
