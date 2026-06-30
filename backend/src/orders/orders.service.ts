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
    const products = await Promise.all(
      dto.items.map((item) =>
        this.prisma.product.findUnique({ where: { id: item.productId } }),
      ),
    );

    for (let i = 0; i < dto.items.length; i++) {
      const product = products[i];
      const item = dto.items[i];
      if (!product)
        throw new BadRequestException(
          `Producto ${item.productId} no encontrado`,
        );
      if (product.stock < item.quantity)
        throw new BadRequestException(
          `Stock insuficiente para "${product.name}"`,
        );
    }

    let total = dto.items.reduce(
      (sum, item, i) => sum + products[i]!.price * item.quantity,
      0,
    );
    const itemsData = dto.items.map((item, i) => ({
      productId: products[i]!.id,
      quantity: item.quantity,
      price: products[i]!.price,
    }));

    if (dto.couponCode) {
      const result = await this.coupons.validate(dto.couponCode, total);
      total = result.finalAmount;
      await this.coupons.use(dto.couponCode);
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        paymentMethod: dto.paymentMethod,
        deliveryName: dto.delivery?.name,
        deliveryPhone: dto.delivery?.phone,
        deliveryAddress: dto.delivery?.address,
        deliveryNotes: dto.delivery?.notes,
        deliveryLat: dto.delivery?.lat,
        deliveryLng: dto.delivery?.lng,
        items: { create: itemsData },
      },
      include: includeAll,
    });

    await Promise.all(
      dto.items.map((item) =>
        this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    try {
      await this.mail.sendOrderConfirmation(order.user.email, order);
    } catch {
      /* mail es no-crítico, el pedido ya fue guardado */
    }
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
