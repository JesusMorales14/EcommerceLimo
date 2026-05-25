import { Component, computed, effect, inject, OnDestroy, OnInit, AfterViewInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../../core/services/cart';
import { AuthService } from '../../core/services/auth.service';
import { OrderService, DeliveryInfo } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { CouponService, CouponResult } from '../../core/services/coupon.service';

declare const L: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutPage implements OnInit, AfterViewInit, OnDestroy {
  cartService        = inject(CartService);
  authService        = inject(AuthService);
  private orderSvc   = inject(OrderService);
  private paymentSvc = inject(PaymentService);
  private couponSvc  = inject(CouponService);
  private router     = inject(Router);

  step = signal(1);

  delivery: DeliveryInfo = { name: '', phone: '', address: '', notes: '' };
  searchAddress = '';
  private map: any = null;
  private mapMarker: any = null;
  mapReady = signal(false);

  paymentMethod  = signal('card');
  cardHolderName = '';
  cardFlipped    = signal(false);

  stripeCardBrand    = signal('');
  stripeCardComplete = signal(false);
  stripeError        = signal('');
  private cardElement: any = null;

  placing = signal(false);
  error   = signal('');

  couponCode      = '';
  couponResult    = signal<CouponResult | null>(null);
  applyingCoupon  = signal(false);
  couponError     = signal('');

  finalTotal = computed(() => this.couponResult()?.finalAmount ?? this.cartService.total());

  orderSuccess = signal(false);

  readonly PAYMENT_METHODS = [
    { id: 'card',        label: 'Tarjeta crédito/débito', icon: 'credit_card',            desc: 'Visa, Mastercard, American Express' },
    { id: 'paypal',      label: 'PayPal',                 icon: 'account_balance_wallet', desc: 'Paga con tu cuenta PayPal de forma segura' },
    { id: 'mercadopago', label: 'Mercado Pago',           icon: 'payments',               desc: 'Todas las tarjetas, cuotas sin interés' },
    { id: 'cash',        label: 'Efectivo al recibir',    icon: 'local_shipping',         desc: 'Paga en efectivo cuando llegue tu pedido' },
  ];

  constructor() {
    // Monta el Stripe Card Element cuando se llega al paso 2 con tarjeta seleccionada
    effect(() => {
      const shouldMount = this.step() === 2 && this.paymentMethod() === 'card';
      if (shouldMount) {
        setTimeout(() => this.mountCardElement(), 100);
      } else {
        this.destroyCardElement();
      }
    });
  }

  ngOnInit() {
    if (this.cartService.getItems()().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }
    const user = this.authService.user();
    if (user) {
      this.delivery.name    = user.name  ?? '';
      this.delivery.phone   = user.phone ?? '';
      this.cardHolderName   = user.name  ?? '';
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 200);
  }

  ngOnDestroy() {
    this.destroyCardElement();
  }

  // ── Stripe Card Element ───────────────────────────────────────────────────

  private mountCardElement() {
    if (this.cardElement) return;
    const container = document.getElementById('stripe-card-element');
    if (!container) return;

    const stripe = this.paymentSvc.getStripe();
    if (!stripe) return;

    const elements = stripe.elements();
    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontFamily: 'inherit',
          fontSize: '15px',
          color: '#1e293b',
          '::placeholder': { color: '#94a3b8' },
        },
        invalid: { color: '#dc2626' },
      },
      hidePostalCode: true,
    });

    this.cardElement.mount('#stripe-card-element');

    this.cardElement.on('change', (event: any) => {
      this.stripeCardBrand.set(event.brand ?? '');
      this.stripeCardComplete.set(event.complete);
      this.stripeError.set(event.error?.message ?? '');
    });
  }

  private destroyCardElement() {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
      this.stripeCardComplete.set(false);
      this.stripeError.set('');
    }
  }

  // ── Mapa ──────────────────────────────────────────────────────────────────

  private initMap() {
    if (typeof L === 'undefined') return;
    const el = document.getElementById('delivery-map');
    if (!el || this.map) return;
    this.map = L.map('delivery-map').setView([-33.4489, -70.6693], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);
    this.map.on('click', (e: any) => this.onMapClick(e.latlng.lat, e.latlng.lng));
    this.mapReady.set(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.map.setView([pos.coords.latitude, pos.coords.longitude], 15);
      });
    }
  }

  private onMapClick(lat: number, lng: number) {
    this.placeMarker(lat, lng);
    this.delivery.lat = lat;
    this.delivery.lng = lng;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(r => r.json())
      .then(d => { if (d.display_name) this.delivery.address = d.display_name; })
      .catch(() => {});
  }

  private placeMarker(lat: number, lng: number) {
    if (this.mapMarker) this.mapMarker.remove();
    this.mapMarker = L.marker([lat, lng]).addTo(this.map);
  }

  searchOnMap() {
    if (!this.searchAddress.trim() || !this.map) return;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.searchAddress)}&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data[0]) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          this.map.setView([lat, lng], 16);
          this.placeMarker(lat, lng);
          this.delivery.lat = lat;
          this.delivery.lng = lng;
          this.delivery.address = data[0].display_name;
        }
      }).catch(() => {});
  }

  // ── Pasos ─────────────────────────────────────────────────────────────────

  nextStep() {
    this.error.set('');
    if (this.step() === 1) {
      if (!this.delivery.name || !this.delivery.phone || !this.delivery.address) {
        this.error.set('Completa nombre, teléfono y dirección de entrega.');
        return;
      }
    }
    if (this.step() === 2 && this.paymentMethod() === 'card') {
      if (!this.stripeCardComplete()) {
        this.error.set('Completa los datos de la tarjeta.');
        return;
      }
    }
    this.step.update(s => s + 1);
    if (this.step() === 1) setTimeout(() => this.initMap(), 300);
  }

  prevStep() { this.error.set(''); this.step.update(s => s - 1); }

  goToStep(n: number) { this.error.set(''); this.step.set(n); }

  // ── Confirmar pedido ──────────────────────────────────────────────────────

  async confirmOrder() {
    this.placing.set(true);
    this.error.set('');

    if (this.paymentMethod() === 'card') {
      await this.confirmWithStripe();
    } else {
      this.submitOrder();
    }
  }

  private async confirmWithStripe() {
    const stripe = this.paymentSvc.getStripe();
    if (!stripe || !this.cardElement) {
      this.error.set('Stripe no está disponible. Recarga la página.');
      this.placing.set(false);
      return;
    }

    try {
      const { clientSecret } = await firstValueFrom(
        this.paymentSvc.createIntent(this.finalTotal())
      );

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: { name: this.cardHolderName },
        },
      });

      if (error) {
        this.error.set(error.message ?? 'Error al procesar el pago.');
        this.placing.set(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        this.submitOrder();
      }
    } catch {
      this.error.set('Error al conectar con la pasarela de pago.');
      this.placing.set(false);
    }
  }

  private submitOrder() {
    const items      = this.cartService.getItems()().map(i => ({ productId: i.product.id, quantity: i.quantity }));
    const payLabel   = this.getMethodLabel(this.paymentMethod());
    const couponCode = this.couponResult() ? this.couponCode.trim() : undefined;
    this.orderSvc.createOrder(items, payLabel, this.delivery, couponCode).subscribe({
      next: () => {
        this.cartService.clear();
        this.placing.set(false);
        this.orderSuccess.set(true);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al procesar el pedido. Intenta nuevamente.');
        this.placing.set(false);
      },
    });
  }

  goToAccount() {
    this.router.navigate(['/account']);
  }

  // ── Cupón ─────────────────────────────────────────────────────────────────

  applyCoupon() {
    if (!this.couponCode.trim()) return;
    this.applyingCoupon.set(true);
    this.couponError.set('');
    this.couponSvc.validate(this.couponCode.trim(), this.cartService.total()).subscribe({
      next: (r) => { this.couponResult.set(r); this.applyingCoupon.set(false); },
      error: (err) => {
        this.couponError.set(err.error?.message ?? 'Cupón inválido o expirado.');
        this.applyingCoupon.set(false);
      },
    });
  }

  removeCoupon() {
    this.couponResult.set(null);
    this.couponCode = '';
    this.couponError.set('');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getMethodLabel(id: string) { return this.PAYMENT_METHODS.find(m => m.id === id)?.label ?? id; }
  getMethodIcon(id: string)  { return this.PAYMENT_METHODS.find(m => m.id === id)?.icon ?? 'payments'; }

  get cardBrandDisplay(): string {
    const b = this.stripeCardBrand();
    const labels: Record<string, string> = { visa: 'VISA', mastercard: 'MASTERCARD', amex: 'AMEX' };
    return labels[b] ?? (b ? b.toUpperCase() : 'CARD');
  }
}
