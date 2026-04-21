import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // 🔥 CREAR ORDEN CON USER
  async createOrder(userId: number, cart: CreateOrderDto) {
    return await this.prisma.$transaction(async (prisma) => {
      let total = 0;

      const groupedItems = new Map<number, number>();

      for (const item of cart.items) {
        const current = groupedItems.get(item.productId) || 0;
        groupedItems.set(item.productId, current + item.quantity);
      }

      const orderItemsData: {
        productId: number;
        quantity: number;
      }[] = [];

      for (const [productId, quantity] of groupedItems.entries()) {
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new BadRequestException(`Producto ${productId} no existe`);
        }

        if (product.stock < quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.name}`,
          );
        }

        total += product.price * quantity;

        orderItemsData.push({
          productId: product.id,
          quantity: quantity,
        });

        // 🔥 DESCONTAR STOCK
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock - quantity,
          },
        });
      }

      const order = await prisma.order.create({
        data: {
          status: 'pending',
          total: total,
          userId: userId, // 🔥 CLAVE (ANTES FALTABA)
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
    });
  }

  // 🔥 SOLO ÓRDENES DEL USUARIO
  async getByUser(userId: number) {
    return this.prisma.order.findMany({
      where: {
        userId: Number(userId),
      },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });
  }
}
