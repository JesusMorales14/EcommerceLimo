import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import type { Coupon } from '@core/models/coupon.model';
import { ConfirmService } from '@core/services/confirm.service';
import { CouponService } from '@core/services/coupon.service';
import { Pagination } from '@shared/components/pagination/pagination';
import { createClientPagination } from '@shared/utils/pagination';
import { CouponForm } from '../../components/coupon-form/coupon-form';
import { CouponsTable } from '../../components/coupons-table/coupons-table';

const PAGE_SIZE = 6;

/** Administración de cupones de descuento. */
@Component({
  selector: 'app-admin-coupons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CouponForm, CouponsTable, Pagination],
  templateUrl: './admin-coupons.html',
  styleUrl: './admin-coupons.scss',
})
export class AdminCouponsPage {
  private readonly couponService = inject(CouponService);
  private readonly confirmService = inject(ConfirmService);

  protected readonly couponsResource = rxResource({ stream: () => this.couponService.getAll() });
  protected readonly coupons = computed(() => (this.couponsResource.hasValue() ? this.couponsResource.value() : []));
  protected readonly pager = createClientPagination(this.coupons, PAGE_SIZE);
  protected readonly showForm = signal(false);

  protected onSaved(): void {
    this.showForm.set(false);
    this.couponsResource.reload();
  }

  protected toggle(coupon: Coupon): void {
    this.couponService.toggle(coupon.id).subscribe((updated) =>
      this.couponsResource.update((list) =>
        list?.map((c) => (c.id === coupon.id ? { ...c, active: updated.active } : c)),
      ),
    );
  }

  protected remove(coupon: Coupon): void {
    if (!this.confirmService.confirm(`¿Eliminar el cupón "${coupon.code}"?`)) return;
    this.couponService.delete(coupon.id).subscribe(() => this.couponsResource.reload());
  }
}
