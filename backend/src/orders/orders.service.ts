import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

const includeAll = {
  items: { include: { product: true } },
  user: { select: { id: true, name: true, email: true } },
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private coupons: CouponsService,
  ) {}

  async createOrder(userId: number, dto: CreateOrderDto) {
    let total = 0;
    const itemsData: { productId: number; quantity: number; price: number }[] =
      [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product)
        throw new BadRequestException(
          `Producto ${item.productId} no encontrado`,
        );
      if (product.stock < item.quantity)
        throw new BadRequestException(
          `Stock insuficiente para "${product.name}"`,
        );

      total += product.price * item.quantity;
      itemsData.push({ productId: product.id, quantity: item.quantity, price: product.price });
    }

    if (dto.couponCode) {
      const result = await this.coupons.validate(dto.couponCode, total);
      total = result.finalAmount;
      await this.coupons.use(dto.couponCode);
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        paymentMethod:   dto.paymentMethod,
        deliveryName:    dto.delivery?.name,
        deliveryPhone:   dto.delivery?.phone,
        deliveryAddress: dto.delivery?.address,
        deliveryNotes:   dto.delivery?.notes,
        deliveryLat:     dto.delivery?.lat,
        deliveryLng:     dto.delivery?.lng,
        items: { create: itemsData },
      },
      include: includeAll,
    });

    // Descontar stock
    for (const item of dto.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await this.mail.sendOrderConfirmation(order.user.email, order);
    return order;
  }

  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: includeAll,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: includeAll,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(orderId: number, dto: UpdateStatusDto) {
    const exists = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!exists) throw new NotFoundException('Pedido no encontrado');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: includeAll,
    });

    await this.mail.sendStatusUpdate(updated.user.email, updated);
    return updated;
  }
}
