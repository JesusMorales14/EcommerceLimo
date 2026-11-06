import { Injectable } from '@nestjs/common';
import type { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { QueryProductsDto } from './dto/query-products.dto';

type Db = Prisma.TransactionClient | PrismaService;

/** Acceso a datos del catálogo de productos. */
@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPage(
    query: QueryProductsDto,
  ): Promise<{ items: Product[]; total: number }> {
    const where = this.buildWhere(query);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total };
  }

  findById(id: number): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  findByIds(ids: number[], db: Db = this.prisma): Promise<Product[]> {
    return db.product.findMany({ where: { id: { in: ids } } });
  }

  /**
   * Descuenta stock de forma atómica solo si hay unidades suficientes
   * (evita sobreventa con pedidos concurrentes). Devuelve si se pudo reservar.
   */
  async decrementStock(id: number, quantity: number, db: Db): Promise<boolean> {
    const { count } = await db.product.updateMany({
      where: { id, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    return count === 1;
  }

  incrementStock(id: number, quantity: number, db: Db): Promise<Product> {
    return db.product.update({
      where: { id },
      data: { stock: { increment: quantity } },
    });
  }

  create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  update(id: number, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data });
  }

  delete(id: number): Promise<Product> {
    return this.prisma.product.delete({ where: { id } });
  }

  /** Ids y nombres para el sitemap. */
  findAllForSitemap(): Promise<Pick<Product, 'id'>[]> {
    return this.prisma.product.findMany({
      select: { id: true },
      orderBy: { id: 'asc' },
    });
  }

  private buildWhere({
    category,
    subCategory,
    isOffer,
    isFeatured,
    search,
  }: QueryProductsDto) {
    const where: Prisma.ProductWhereInput = {
      category,
      subCategory,
      isOffer,
      isFeatured,
    };
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    return where;
  }
}
