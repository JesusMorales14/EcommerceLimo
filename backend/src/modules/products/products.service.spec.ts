import { NotFoundException } from '@nestjs/common';
import type { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const repo = {
    findPage: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const service = new ProductsService(repo as unknown as ProductsRepository);

  beforeEach(() => jest.clearAllMocks());

  it('findAll devuelve la página con el total de páginas', async () => {
    repo.findPage.mockResolvedValue({ items: [{ id: 1 }], total: 81 });
    await expect(service.findAll({ page: 2, limit: 40 })).resolves.toEqual({
      items: [{ id: 1 }],
      total: 81,
      page: 2,
      limit: 40,
      pages: 3,
    });
  });

  it('findOne lanza NotFound si el producto no existe', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('update y remove verifican la existencia antes de modificar', async () => {
    repo.findById.mockResolvedValue({ id: 1 });
    repo.update.mockResolvedValue({ id: 1, name: 'Nuevo' });
    repo.delete.mockResolvedValue({ id: 1 });

    await expect(service.update(1, { name: 'Nuevo' })).resolves.toEqual({
      id: 1,
      name: 'Nuevo',
    });
    await expect(service.remove(1)).resolves.toEqual({ id: 1 });

    repo.findById.mockResolvedValue(null);
    await expect(service.remove(2)).rejects.toThrow(NotFoundException);
    expect(repo.delete).toHaveBeenCalledTimes(1);
  });

  it('create delega en el repositorio', async () => {
    repo.create.mockResolvedValue({ id: 3 });
    const dto = {
      name: 'X',
      description: '',
      price: 1,
      stock: 1,
      brand: 'B',
      category: 'c',
      images: [],
    };
    await expect(service.create(dto)).resolves.toEqual({ id: 3 });
  });
});
