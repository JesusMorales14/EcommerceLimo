import type { Coupon } from '@prisma/client';

const PERCENT = 100;
const CENTS = 100;

export type CouponRejection =
  | 'inactive'
  | 'expired'
  | 'exhausted'
  | 'below-minimum';

export const COUPON_REJECTION_MESSAGES: Record<
  CouponRejection,
  (coupon: Coupon) => string
> = {
  inactive: () => 'Cupón inactivo',
  expired: () => 'Cupón expirado',
  exhausted: () => 'Cupón agotado',
  'below-minimum': (coupon) =>
    `Monto mínimo para este cupón: S/ ${coupon.minAmount.toFixed(2)}`,
};

/** Reglas de negocio de validez de un cupón (función pura, sin dependencias de infraestructura). */
export function findCouponRejection(
  coupon: Coupon,
  amount: number,
  now = new Date(),
): CouponRejection | null {
  if (!coupon.active) return 'inactive';
  if (coupon.expiresAt && coupon.expiresAt < now) return 'expired';
  if (coupon.usedCount >= coupon.maxUses) return 'exhausted';
  if (amount < coupon.minAmount) return 'below-minimum';
  return null;
}

const roundCurrency = (value: number) => Math.round(value * CENTS) / CENTS;

/** Calcula el descuento aplicable (porcentual o monto fijo) sin superar el total. */
export function calculateDiscount(
  coupon: Pick<Coupon, 'discount' | 'isPercent'>,
  amount: number,
): number {
  const discount = coupon.isPercent
    ? amount * (coupon.discount / PERCENT)
    : coupon.discount;
  return roundCurrency(Math.min(discount, amount));
}

export interface CouponQuote {
  code: string;
  discount: number;
  isPercent: boolean;
  discountAmount: number;
  finalAmount: number;
}

export function quoteCoupon(coupon: Coupon, amount: number): CouponQuote {
  const discountAmount = calculateDiscount(coupon, amount);
  return {
    code: coupon.code,
    discount: coupon.discount,
    isPercent: coupon.isPercent,
    discountAmount,
    finalAmount: roundCurrency(Math.max(0, amount - discountAmount)),
  };
}
