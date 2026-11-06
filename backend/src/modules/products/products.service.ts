import { Injectable, NotFoundException } from '@nestjs/common';
import type { Product } from '@prisma/client';
import {
  paginate,
  type Paginated,
} from '../../common/interfaces/paginated.interface';
import type { CreateProductDto } from './dto/create-product.dto';
import type { QueryProductsDto } from './dto/query-products.dto';
import type { UpdateProductDto } from './dto/update-product.dto';
import { ProductsRepository } from './products.repository';

/** Casos de uso del catálogo. */
@Injectable()
export class ProductsService {
  constructor(private readonly products: ProductsRepository) {}

  async findAll(query: QueryProductsDto): Promise<Paginated<Product>> {
    const { items, total } = await this.products.findPage(query);
    return paginate(items, total, query.page, query.limit);
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.products.findById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  create(dto: CreateProductDto): Promise<Product> {
    return this.products.create(dto);
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);
    return this.products.update(id, dto);
  }

  async remove(id: number): Promise<Product> {
    await this.findOne(id);
    return this.products.delete(id);
  }
}
