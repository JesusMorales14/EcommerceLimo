import type { HttpErrorResponse } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import type { CouponResult } from '@core/services/coupon.service';
import { CouponService } from '@core/services/coupon.service';
import { OrderService } from '@core/services/order.service';
import { extractErrorMessage } from '@shared/utils/http-error';
import type { CardData, DeliveryInfo, PaymentMethodId } from './checkout.models';
import { CheckoutStep, EMPTY_CARD, EMPTY_DELIVERY } from './checkout.models';
import { validateCard, validateDelivery } from './checkout.validators';
import { findPaymentMethod } from './payment-methods';

/** Retardo que simula la autorización de la pasarela de pago. */
export const SIMULATED_PAYMENT_DELAY_MS = 2000;

const ORDER_OFFLINE_MESSAGE = 'No se pudo conectar al servidor. Verifica tu conexión e intenta nuevamente.';
const COUPON_OFFLINE_MESSAGE = 'No se pudo conectar al servidor. Espera un momento y vuelve a intentarlo.';

/**
 * Estado y casos de uso del proceso de compra (patrón Store/Facade).
 * Se provee a nivel de la página de checkout, por lo que su vida útil
 * coincide con la de la página y los subcomponentes lo comparten.
 */
@Injectable()
export class CheckoutStore {
  private readonly cart = inject(CartService);
  private readonly orders = inject(OrderService);
  private readonly coupons = inject(CouponService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Estado ────────────────────────────────────────────────────────────────
  readonly step = signal(CheckoutStep.Delivery);
  readonly delivery = signal<DeliveryInfo>({ ...EMPTY_DELIVERY });
  readonly paymentMethod = signal<PaymentMethodId>('card');
  readonly card = signal<CardData>({ ...EMPTY_CARD });
  readonly error = signal('');
  readonly placing = signal(false);
  readonly orderSuccess = signal(false);

  readonly coupon = signal<CouponResult | null>(null);
  readonly couponError = signal('');
  readonly applyingCoupon = signal(false);

  // ── Derivados ─────────────────────────────────────────────────────────────
  readonly items = this.cart.items;
  readonly itemCount = this.cart.count;
  readonly subtotal = this.cart.total;
  readonly total = computed(() => this.coupon()?.finalAmount ?? this.cart.total());
  readonly selectedPaymentMethod = computed(() => findPaymentMethod(this.paymentMethod()));
  readonly hasLocation = computed(() => this.delivery().lat != null && this.delivery().lng != null);

  /** Precarga los datos del usuario autenticado. */
  prefill(user: ReturnType<AuthService['user']>): void {
    if (!user) return;
    this.delivery.update((d) => ({ ...d, name: user.name ?? '', phone: user.phone ?? '' }));
    this.card.update((c) => ({ ...c, holder: user.name ?? '' }));
  }

  updateDelivery(patch: Partial<DeliveryInfo>): void {
    this.delivery.update((d) => ({ ...d, ...patch }));
  }

  updateCard(patch: Partial<CardData>): void {
    this.card.update((c) => ({ ...c, ...patch }));
  }

  selectPaymentMethod(id: PaymentMethodId): void {
    this.paymentMethod.set(id);
  }

  // ── Navegación entre pasos ────────────────────────────────────────────────
  nextStep(): void {
    const validationError = this.validateCurrentStep();
    this.error.set(validationError ?? '');
    if (!validationError) this.step.update((s) => s + 1);
  }

  prevStep(): void {
    this.goToStep(this.step() - 1);
  }

  goToStep(step: CheckoutStep): void {
    this.error.set('');
    this.step.set(step);
  }

  private validateCurrentStep(): string | null {
    switch (this.step()) {
      case CheckoutStep.Delivery:
        return validateDelivery(this.delivery());
      case CheckoutStep.Payment:
        return this.paymentMethod() === 'card' ? validateCard(this.card()) : null;
      default:
        return null;
    }
  }

  // ── Cupones ───────────────────────────────────────────────────────────────
  applyCoupon(code: string): void {
    const normalized = code.trim();
    if (!normalized) return;
    this.applyingCoupon.set(true);
    this.couponError.set('');
    this.coupons
      .validate(normalized, this.cart.total())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.coupon.set(result);
          this.applyingCoupon.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.couponError.set(extractErrorMessage(err, 'Cupón inválido o expirado.', COUPON_OFFLINE_MESSAGE));
          this.applyingCoupon.set(false);
        },
      });
  }

  removeCoupon(): void {
    this.coupon.set(null);
    this.couponError.set('');
  }

  // ── Confirmación ──────────────────────────────────────────────────────────
  async confirmOrder(): Promise<void> {
    this.placing.set(true);
    this.error.set('');
    if (this.paymentMethod() === 'card') {
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_PAYMENT_DELAY_MS));
    }
    this.submitOrder();
  }

  private submitOrder(): void {
    const items = this.cart.items().map((i) => ({ productId: i.product.id, quantity: i.quantity }));
    const paymentLabel = this.selectedPaymentMethod()?.label ?? this.paymentMethod();

    this.orders
      .createOrder(items, paymentLabel, this.delivery(), this.coupon()?.code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cart.clear();
          this.placing.set(false);
          this.orderSuccess.set(true);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(
            extractErrorMessage(err, 'Error al procesar el pedido. Intenta nuevamente.', ORDER_OFFLINE_MESSAGE),
          );
          this.placing.set(false);
        },
      });
  }
}
