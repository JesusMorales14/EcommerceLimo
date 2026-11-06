import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import type { Product } from '@core/models/product.model';
import { CartService } from '@core/services/cart.service';
import { CheckoutStep } from './checkout.models';
import { CheckoutStore, SIMULATED_PAYMENT_DELAY_MS } from './checkout.store';

const PRODUCT: Product = {
  id: 1, name: 'Laptop', brand: 'Dell', price: 3000, stock: 5, images: ['laptop.jpg'],
  colors: [], sizes: [], category: 'tecnologia', description: '', isOffer: false,
};
const VALID_DELIVERY = { name: 'Ana', phone: '987654321', address: 'Av. Larco 123' };
const VALID_CARD = { holder: 'ANA', number: '4111 1111 1111 1111', expiry: '12/30', cvv: '123' };
const COUPON = { code: 'DESC10', discount: 10, isPercent: true, discountAmount: 300, finalAmount: 2700 };

describe('CheckoutStore', () => {
  let store: CheckoutStore;
  let cart: CartService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [CheckoutStore, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    store = TestBed.inject(CheckoutStore);
    cart = TestBed.inject(CartService);
    http = TestBed.inject(HttpTestingController);
    cart.addToCart(PRODUCT);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('prefill copia nombre y teléfono del usuario', () => {
    store.prefill({ id: 1, name: 'Ana García', email: 'a@a.com', role: 'USER', phone: '999' });
    expect(store.delivery().name).toBe('Ana García');
    expect(store.delivery().phone).toBe('999');
    expect(store.card().holder).toBe('Ana García');
  });

  describe('navegación entre pasos', () => {
    it('no avanza si faltan datos de entrega', () => {
      store.nextStep();
      expect(store.step()).toBe(CheckoutStep.Delivery);
      expect(store.error()).toContain('Completa');
    });

    it('avanza al pago con datos de entrega válidos', () => {
      store.updateDelivery(VALID_DELIVERY);
      store.nextStep();
      expect(store.step()).toBe(CheckoutStep.Payment);
      expect(store.error()).toBe('');
    });

    it('valida la tarjeta solo cuando el método es tarjeta', () => {
      store.goToStep(CheckoutStep.Payment);
      store.nextStep();
      expect(store.error()).toContain('número de tarjeta');

      store.selectPaymentMethod('cash');
      store.nextStep();
      expect(store.step()).toBe(CheckoutStep.Confirm);
    });

    it('prevStep retrocede y limpia el error', () => {
      store.goToStep(CheckoutStep.Payment);
      store.error.set('x');
      store.prevStep();
      expect(store.step()).toBe(CheckoutStep.Delivery);
      expect(store.error()).toBe('');
    });
  });

  describe('cupones', () => {
    it('ignora códigos vacíos', () => {
      store.applyCoupon('   ');
      http.expectNone((r) => r.url.includes('/coupons'));
    });

    it('aplica un cupón válido y recalcula el total', () => {
      store.applyCoupon('DESC10');
      http.expectOne((r) => r.url.includes('/coupons/validate')).flush(COUPON);
      expect(store.coupon()?.code).toBe('DESC10');
      expect(store.total()).toBe(2700);
      expect(store.applyingCoupon()).toBe(false);
    });

    it('muestra el error del backend si el cupón es inválido', () => {
      store.applyCoupon('MALO');
      http
        .expectOne((r) => r.url.includes('/coupons/validate'))
        .flush({ message: 'Cupón expirado' }, { status: 400, statusText: 'Bad Request' });
      expect(store.couponError()).toBe('Cupón expirado');
      expect(store.coupon()).toBeNull();
    });

    it('removeCoupon vuelve al total del carro', () => {
      store.coupon.set(COUPON);
      store.removeCoupon();
      expect(store.total()).toBe(cart.total());
    });
  });

  describe('confirmOrder', () => {
    beforeEach(() => {
      store.updateDelivery(VALID_DELIVERY);
      store.updateCard(VALID_CARD);
    });

    it('crea el pedido, vacía el carro y marca el éxito (pago en efectivo)', async () => {
      store.selectPaymentMethod('cash');
      await store.confirmOrder();

      const req = http.expectOne((r) => r.url.endsWith('/orders'));
      expect(req.request.body.items).toEqual([{ productId: 1, quantity: 1 }]);
      expect(req.request.body.paymentMethod).toBe('Efectivo al recibir');
      req.flush({ id: 10 });

      expect(store.orderSuccess()).toBe(true);
      expect(cart.isEmpty()).toBe(true);
    });

    it('simula la autorización de la tarjeta antes de enviar el pedido', async () => {
      vi.useFakeTimers();
      const pending = store.confirmOrder();
      http.expectNone((r) => r.url.endsWith('/orders'));
      await vi.advanceTimersByTimeAsync(SIMULATED_PAYMENT_DELAY_MS);
      await pending;
      http.expectOne((r) => r.url.endsWith('/orders')).flush({ id: 11 });
      expect(store.orderSuccess()).toBe(true);
    });

    it('envía el código de cupón aplicado', async () => {
      store.selectPaymentMethod('cash');
      store.coupon.set(COUPON);
      await store.confirmOrder();
      const req = http.expectOne((r) => r.url.endsWith('/orders'));
      expect(req.request.body.couponCode).toBe('DESC10');
      req.flush({ id: 12 });
    });

    it('muestra un error de conexión si el servidor no responde', async () => {
      store.selectPaymentMethod('cash');
      await store.confirmOrder();
      http.expectOne((r) => r.url.endsWith('/orders')).error(new ProgressEvent('error'), { status: 0 });
      expect(store.error()).toContain('No se pudo conectar');
      expect(store.placing()).toBe(false);
    });
  });
});
