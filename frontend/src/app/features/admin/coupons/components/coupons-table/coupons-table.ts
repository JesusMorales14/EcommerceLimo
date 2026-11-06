import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Coupon } from '@core/models/coupon.model';
import { CurrencyPenPipe } from '@shared/pipes';

/** Tabla de cupones con acciones para activar/desactivar y eliminar. */
@Component({
  selector: 'app-coupons-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, CurrencyPenPipe],
  templateUrl: './coupons-table.html',
  styleUrl: './coupons-table.scss',
})
export class CouponsTable {
  readonly coupons = input.required<readonly Coupon[]>();
  readonly toggled = output<Coupon>();
  readonly removed = output<Coupon>();
}
