import type { Coupon } from '@prisma/client';
import {
  calculateDiscount,
  findCouponRejection,
  quoteCoupon,
} from './coupon-pricing';

const coupon = (overrides: Partial<Coupon> = {}): Coupon => ({
  id: 1,
  code: 'DESC10',
  discount: 10,
  isPercent: true,
  minAmount: 0,
  maxUses: 100,
  usedCount: 0,
  active: true,
  expiresAt: null,
  createdAt: new Date(),
  ...overrides,
});

describe('coupon-pricing', () => {
  it.each([
    [{ active: false }, 'inactive'],
    [{ expiresAt: new Date('2000-01-01') }, 'expired'],
    [{ usedCount: 100 }, 'exhausted'],
    [{ minAmount: 500 }, 'below-minimum'],
  ] as const)('rechaza el cupón %o', (overrides, reason) => {
    expect(findCouponRejection(coupon(overrides), 100)).toBe(reason);
  });

  it('acepta un cupón vigente', () => {
    expect(findCouponRejection(coupon(), 100)).toBeNull();
  });

  it('calcula descuentos porcentuales y fijos sin superar el monto', () => {
    expect(calculateDiscount({ discount: 15, isPercent: true }, 99.99)).toBe(
      15,
    );
    expect(calculateDiscount({ discount: 50, isPercent: false }, 30)).toBe(30);
  });

  it('quoteCoupon devuelve el monto final', () => {
    expect(quoteCoupon(coupon({ discount: 20 }), 250)).toEqual({
      code: 'DESC10',
      discount: 20,
      isPercent: true,
      discountAmount: 50,
      finalAmount: 200,
    });
  });
});
