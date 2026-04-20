import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(cart: CreateOrderDto) {
    let total = 0;

    const orderItemsData: {
      productId: number;
      quantity: number;
    }[] = [];

    for (const item of cart.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new BadRequestException(`Producto ${item.productId} no existe`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para ${product.name}`,
        );
      }

      total += product.price * item.quantity;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
      });
    }

    const order = await this.prisma.order.create({
      data: {
        status: 'pending',
        total: total,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  }

  async getOrders() {
    return await this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}
