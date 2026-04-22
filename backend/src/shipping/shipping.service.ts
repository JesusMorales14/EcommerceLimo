import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  // ✅ Crear envío
  async create(data: {
    orderId: number;
    address: string;
    city: string;
    country: string;
  }) {
    // 1. verificar orden
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new BadRequestException('Orden no existe');
    }

    // 2. evitar duplicado
    const existing = await this.prisma.shipping.findUnique({
      where: { orderId: data.orderId },
    });

    if (existing) {
      throw new BadRequestException('Ya existe shipping para esta orden');
    }

    // 3. crear shipping
    const shipping = await this.prisma.shipping.create({
      data: {
        ...data,
        status: 'pending',
      },
    });

    // 🔥 4. CREAR EVENTO INICIAL (AQUÍ VA)
    await this.prisma.shippingEvent.create({
      data: {
        shippingId: shipping.id,
        status: 'pending',
      },
    });

    return shipping;
  }

  // ✅ obtener por orden
  async findByOrder(orderId: number) {
    return this.prisma.shipping.findUnique({
      where: { orderId },
    });
  }

  // ✅ actualizar estado
  async updateStatus(id: number, status: string) {
    const shipping = await this.prisma.shipping.findUnique({
      where: { id },
    });

    if (!shipping) {
      throw new BadRequestException('Shipping no existe');
    }

    const normalizedStatus = status.toLowerCase().trim();

    // flujo válido
    const validTransitions = {
      pending: ['shipped'],
      shipped: ['delivered'],
      delivered: [],
    };

    if (!validTransitions[shipping.status]?.includes(normalizedStatus)) {
      throw new BadRequestException(
        `No puedes pasar de ${shipping.status} a ${normalizedStatus}`,
      );
    }

    // 🔥 1. actualizar estado
    const updated = await this.prisma.shipping.update({
      where: { id },
      data: { status: normalizedStatus },
    });

    // 🔥 2. GUARDAR EVENTO (AQUÍ VA)
    await this.prisma.shippingEvent.create({
      data: {
        shippingId: shipping.id,
        status: normalizedStatus,
      },
    });

    return updated;
  }

  // 🔥 NUEVO: obtener tracking
  async getTracking(shippingId: number) {
    return this.prisma.shippingEvent.findMany({
      where: { shippingId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
