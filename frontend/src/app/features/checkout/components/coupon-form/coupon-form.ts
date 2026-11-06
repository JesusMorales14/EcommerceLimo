import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckoutStore } from '../../data/checkout.store';

/** Campo para aplicar o quitar un cupón de descuento. */
@Component({
  selector: 'app-coupon-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './coupon-form.html',
  styleUrl: './coupon-form.scss',
})
export class CouponForm {
  protected readonly store = inject(CheckoutStore);
  protected readonly code = signal('');

  protected apply(): void {
    this.store.applyCoupon(this.code());
  }

  protected remove(): void {
    this.store.removeCoupon();
    this.code.set('');
  }
}
