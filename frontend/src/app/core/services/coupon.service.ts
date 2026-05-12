import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface CouponResult {
  code: string;
  discount: number;
  isPercent: boolean;
  discountAmount: number;
  finalAmount: number;
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  private api = inject(ApiService);

  validate(code: string, amount: number) {
    return this.api.get<CouponResult>('/coupons/validate', {
      code,
      amount: String(amount),
    });
  }

  getAll() {
    return this.api.get<any[]>('/coupons');
  }

  create(data: {
    code: string;
    discount: number;
    isPercent: boolean;
    minAmount: number;
    maxUses: number;
    expiresAt?: string;
  }) {
    return this.api.post<any>('/coupons', data);
  }

  toggle(id: number) {
    return this.api.patch<any>(`/coupons/${id}/toggle`, {});
  }

  delete(id: number) {
    return this.api.delete<void>(`/coupons/${id}`);
  }
}
