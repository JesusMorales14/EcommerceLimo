import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // LISTADO (adaptado al frontend mock)
  async findAll() {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
      },
    });

    return products.map((p) => ({
      // frontend espera string tipo prod-001
      id: `prod-${p.id.toString().padStart(3, '0')}`,

      name: p.name,
      brand: p.brand ?? 'unknown',

      description: p.description,
      price: p.price,
      stock: p.stock,

      images: p.images,
      colors: p.colors,
      sizes: p.sizes,

      // ADAPTACIÓN CLAVE
      category: p.category?.name ?? 'unknown',
      subCategory: p.subCategory ?? null,

      tags: p.tags ?? [],
      isOffer: p.isOffer,
      discount: p.discount ?? 0,
    }));
  }

  // DETALLE
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) return null;

    return {
      id: `prod-${product.id.toString().padStart(3, '0')}`,
      name: product.name,
      brand: product.brand ?? 'Generic Brand',
      description: product.description,
      price: product.price,
      stock: product.stock,

      images: product.images,
      colors: product.colors,
      sizes: product.sizes,

      category: product.category?.name ?? 'unknown',
      subCategory: product.subCategory ?? null,

      tags: product.tags ?? [],
      isOffer: product.isOffer ?? false,
      discount: product.discount ?? 0,
    };
  }

  // ✅ CREAR PRODUCTO
  async create(data: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        brand: data.brand ?? null,
        description: data.description,
        price: data.price,
        discount: data.discount ?? null,
        stock: data.stock,
        images: data.images,
        colors: data.colors,
        sizes: data.sizes,

        categoryId: data.categoryId,

        tags: data.tags ?? [],
        isOffer: data.isOffer ?? false,
        subCategory: data.subCategory ?? null,
      },
    });
  }
}
