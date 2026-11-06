import type { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CouponService } from '@core/services/coupon.service';
import { extractErrorMessage } from '@shared/utils/http-error';

const DEFAULT_DISCOUNT = 10;
const DEFAULT_MAX_USES = 100;
const MAX_PERCENT = 100;

/** Formulario para crear cupones de descuento. */
@Component({
  selector: 'app-coupon-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './coupon-form.html',
  styleUrl: './coupon-form.scss',
})
export class CouponForm {
  private readonly coupons = inject(CouponService);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly form = inject(FormBuilder).nonNullable.group({
    code: ['', Validators.required],
    discount: [DEFAULT_DISCOUNT, [Validators.required, Validators.min(1)]],
    isPercent: [true],
    minAmount: [0, Validators.min(0)],
    maxUses: [DEFAULT_MAX_USES, Validators.min(1)],
    expiresAt: [''],
  });

  protected save(): void {
    const value = this.form.getRawValue();
    if (!value.code.trim()) {
      this.error.set('El código es obligatorio.');
      return;
    }
    if (this.form.invalid || (value.isPercent && value.discount > MAX_PERCENT)) {
      this.error.set('Revisa los valores del cupón.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.coupons
      .create({
        ...value,
        code: value.code.trim().toUpperCase(),
        expiresAt: value.expiresAt ? new Date(value.expiresAt).toISOString() : undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(extractErrorMessage(err, 'Error al crear el cupón.'));
          this.saving.set(false);
        },
      });
  }
}
