import type { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { QueryProductsDto } from './dto/query-products.dto';
import { ProductsRepository } from './products.repository';

function createPrismaMock() {
  const product = {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };
  const prisma = {
    product,
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };
  return { prisma, product };
}

describe('ProductsRepository', () => {
  let repo: ProductsRepository;
  let product: ReturnType<typeof createPrismaMock>['product'];

  beforeEach(() => {
    const mock = createPrismaMock();
    product = mock.product;
    repo = new ProductsRepository(mock.prisma as unknown as PrismaService);
  });

  it('findPage pagina y aplica búsqueda insensible a mayúsculas', async () => {
    product.findMany.mockResolvedValue([{ id: 1 }]);
    product.count.mockResolvedValue(11);

    const page = await repo.findPage({
      page: 2,
      limit: 10,
      category: 'tecnologia',
      search: 'sam',
    } as QueryProductsDto);

    expect(page).toEqual({ items: [{ id: 1 }], total: 11 });
    const args = product.findMany.mock.calls[0][0];
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);
    expect(args.where.category).toBe('tecnologia');
    expect(args.where.OR).toHaveLength(2);
  });

  it('findPage no agrega filtro OR cuando no hay búsqueda', async () => {
    await repo.findPage({ page: 1, limit: 5 } as QueryProductsDto);
    expect(product.findMany.mock.calls[0][0].where.OR).toBeUndefined();
  });

  it('decrementStock solo reserva si hay stock suficiente', async () => {
    const db = { product } as unknown as PrismaService;
    product.updateMany.mockResolvedValueOnce({ count: 1 });
    await expect(repo.decrementStock(1, 2, db)).resolves.toBe(true);
    expect(product.updateMany).toHaveBeenCalledWith({
      where: { id: 1, stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });

    product.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(repo.decrementStock(1, 99, db)).resolves.toBe(false);
  });

  it('delega las operaciones CRUD en Prisma', async () => {
    await repo.findById(3);
    await repo.findByIds([1, 2]);
    await repo.incrementStock(1, 2, { product } as unknown as PrismaService);
    await repo.create({ name: 'x' } as never);
    await repo.update(1, { name: 'y' });
    await repo.delete(1);
    await repo.findAllForSitemap();

    expect(product.findUnique).toHaveBeenCalledWith({ where: { id: 3 } });
    expect(product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { stock: { increment: 2 } },
    });
    expect(product.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
