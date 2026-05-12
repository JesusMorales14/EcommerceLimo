import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async validate(code: string, amount: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) throw new NotFoundException('Cupón no encontrado');
    if (!coupon.active) throw new BadRequestException('Cupón inactivo');
    if (coupon.expiresAt && coupon.expiresAt < new Date())
      throw new BadRequestException('Cupón expirado');
    if (coupon.usedCount >= coupon.maxUses)
      throw new BadRequestException('Cupón agotado');
    if (amount < coupon.minAmount)
      throw new BadRequestException(
        `Monto mínimo para este cupón: $${coupon.minAmount}`,
      );

    const discountAmount = coupon.isPercent
      ? Math.round(amount * (coupon.discount / 100) * 100) / 100
      : Math.min(coupon.discount, amount);

    return {
      code: coupon.code,
      discount: coupon.discount,
      isPercent: coupon.isPercent,
      discountAmount,
      finalAmount: Math.max(0, amount - discountAmount),
    };
  }

  async use(code: string) {
    await this.prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  }

  async findAll() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(data: {
    code: string;
    discount: number;
    isPercent: boolean;
    minAmount: number;
    maxUses: number;
    expiresAt?: string;
  }) {
    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discount: data.discount,
        isPercent: data.isPercent,
        minAmount: data.minAmount,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async toggle(id: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Cupón no encontrado');
    return this.prisma.coupon.update({
      where: { id },
      data: { active: !coupon.active },
    });
  }

  async remove(id: number) {
    return this.prisma.coupon.delete({ where: { id } });
  }
}
