import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

const mockProduct = {
  id: 1,
  name: 'Samsung Galaxy S24',
  brand: 'Samsung',
  price: 1899,
  stock: 10,
  images: [],
  colors: [],
  sizes: [],
  category: 'tecnologia',
  subCategory: 'smartphones',
  description: 'Smartphone de alta gama',
  isOffer: false,
  discount: null,
  colorImages: {},
  createdAt: new Date(),
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      product: {
        findMany:   jest.fn(),
        findUnique: jest.fn(),
        create:     jest.fn(),
        update:     jest.fn(),
        delete:     jest.fn(),
        count:      jest.fn(),
      },
      order: {
        count:     jest.fn(),
        aggregate: jest.fn(),
        findMany:  jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  // ── findAll ──────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('retorna productos con paginación por defecto', async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);
      prisma.product.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pages).toBe(1);
    });

    it('filtra por categoría cuando se indica', async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);
      prisma.product.count.mockResolvedValue(1);

      await service.findAll('tecnologia');

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'tecnologia' }),
        }),
      );
    });

    it('aplica búsqueda por texto en nombre, marca y descripción', async () => {
      prisma.product.findMany.mockResolvedValue([mockProduct]);
      prisma.product.count.mockResolvedValue(1);

      await service.findAll(undefined, undefined, undefined, 'samsung');

      const callArgs = prisma.product.findMany.mock.calls[0][0];
      expect(callArgs.where).toHaveProperty('OR');
    });

    it('calcula correctamente el número de páginas', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(85);

      const result = await service.findAll(undefined, undefined, undefined, undefined, 1, 40);

      expect(result.pages).toBe(3);
    });

    it('filtra solo ofertas cuando isOffer es true', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.findAll(undefined, undefined, true);

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isOffer: true }),
        }),
      );
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('retorna el producto si existe', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Samsung Galaxy S24');
    });

    it('lanza NotFoundException si el producto no existe', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('crea y retorna el producto con los datos enviados', async () => {
      prisma.product.create.mockResolvedValue(mockProduct);

      const dto = {
        name: 'Samsung Galaxy S24', brand: 'Samsung', price: 1899, stock: 10,
        images: [], colors: [], sizes: [], category: 'tecnologia',
        subCategory: 'smartphones', description: 'Smartphone', isOffer: false, colorImages: {},
      };

      const result = await service.create(dto);

      expect(result.name).toBe('Samsung Galaxy S24');
      expect(prisma.product.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  // ── update ───────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('actualiza el producto si existe', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.product.update.mockResolvedValue({ ...mockProduct, price: 2000 });

      const result = await service.update(1, { price: 2000 });

      expect(result.price).toBe(2000);
      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });

    it('lanza NotFoundException si el producto no existe', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { price: 2000 })).rejects.toThrow(NotFoundException);
    });

    it('no llama a update si el producto no existe', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { price: 2000 })).rejects.toThrow();
      expect(prisma.product.update).not.toHaveBeenCalled();
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('elimina el producto si existe y lo retorna', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove(1);

      expect(result.id).toBe(1);
      expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('lanza NotFoundException si el producto no existe', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('no llama a delete si el producto no existe', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow();
      expect(prisma.product.delete).not.toHaveBeenCalled();
    });
  });
});
