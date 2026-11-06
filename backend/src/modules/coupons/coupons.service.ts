import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Coupon, Prisma } from '@prisma/client';
import {
  COUPON_REJECTION_MESSAGES,
  type CouponQuote,
  findCouponRejection,
  quoteCoupon,
} from './domain/coupon-pricing';
import { CouponsRepository } from './coupons.repository';
import type { CreateCouponDto } from './dto/create-coupon.dto';

/** Casos de uso de cupones de descuento. */
@Injectable()
export class CouponsService {
  constructor(private readonly coupons: CouponsRepository) {}

  /** Valida un cupón contra un monto y devuelve el descuento resultante. */
  async quote(
    code: string,
    amount: number,
    db?: Prisma.TransactionClient,
  ): Promise<CouponQuote & { id: number }> {
    const coupon = await this.coupons.findByCode(code, db);
    if (!coupon) throw new NotFoundException('Cupón no encontrado');
    const rejection = findCouponRejection(coupon, amount);
    if (rejection)
      throw new BadRequestException(
        COUPON_REJECTION_MESSAGES[rejection](coupon),
      );
    return { id: coupon.id, ...quoteCoupon(coupon, amount) };
  }

  /** Canjea el cupón dentro de una transacción; falla si se agotó en paralelo. */
  async redeem(couponId: number, db: Prisma.TransactionClient): Promise<void> {
    if (!(await this.coupons.redeem(couponId, db))) {
      throw new BadRequestException('Cupón agotado');
    }
  }

  findAll(): Promise<Coupon[]> {
    return this.coupons.findAll();
  }

  create(dto: CreateCouponDto): Promise<Coupon> {
    return this.coupons.create({
      ...dto,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
  }

  async toggle(id: number): Promise<Coupon> {
    const coupon = await this.findOrFail(id);
    return this.coupons.setActive(id, !coupon.active);
  }

  async remove(id: number): Promise<Coupon> {
    await this.findOrFail(id);
    return this.coupons.delete(id);
  }

  private async findOrFail(id: number): Promise<Coupon> {
    const coupon = await this.coupons.findById(id);
    if (!coupon) throw new NotFoundException('Cupón no encontrado');
    return coupon;
  }
}
