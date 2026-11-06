import { inject, Injectable } from '@angular/core';
import type { Coupon, CouponResult, CreateCouponInput } from '../models/coupon.model';
import { ApiService } from './api.service';

export type { CouponResult } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly api = inject(ApiService);

  validate(code: string, amount: number) {
    return this.api.get<CouponResult>('/coupons/validate', { code, amount: String(amount) });
  }

  getAll() {
    return this.api.get<Coupon[]>('/coupons');
  }

  create(data: CreateCouponInput) {
    return this.api.post<Coupon>('/coupons', data);
  }

  toggle(id: number) {
    return this.api.patch<Coupon>(`/coupons/${id}/toggle`, {});
  }

  delete(id: number) {
    return this.api.delete<void>(`/coupons/${id}`);
  }
}
