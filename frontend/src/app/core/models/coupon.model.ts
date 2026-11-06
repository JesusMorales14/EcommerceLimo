export interface Coupon {
  id: number;
  code: string;
  discount: number;
  isPercent: boolean;
  minAmount: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateCouponInput {
  code: string;
  discount: number;
  isPercent: boolean;
  minAmount: number;
  maxUses: number;
  expiresAt?: string;
}

/** Resultado de validar un cupón contra un monto. */
export interface CouponResult {
  code: string;
  discount: number;
  isPercent: boolean;
  discountAmount: number;
  finalAmount: number;
}
