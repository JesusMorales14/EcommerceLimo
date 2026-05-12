import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    category?: string,
    subCategory?: string,
    isOffer?: boolean,
    search?: string,
    page = 1,
    limit = 40,
  ) {
    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { brand: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const where: any = {
      ...(category !== undefined ? { category } : {}),
      ...(subCategory !== undefined ? { subCategory } : {}),
      ...(isOffer !== undefined ? { isOffer } : {}),
      ...searchFilter,
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const p = await this.prisma.product.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Producto no encontrado');
    return p;
  }

  async create(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }

  async update(id: number, data: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }

  async getStats() {
    const [totalProducts, lowStock, totalOrders, revenue, recentOrders] =
      await Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({ where: { stock: { lt: 5 } } }),
        this.prisma.order.count(),
        this.prisma.order.aggregate({ _sum: { total: true } }),
        this.prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, email: true } } },
        }),
      ]);

    return {
      totalProducts,
      lowStock,
      totalOrders,
      totalRevenue: revenue._sum.total ?? 0,
      recentOrders,
    };
  }
}
