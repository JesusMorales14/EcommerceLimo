import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { CheckoutPage } from './checkout';
import { CartService } from '../../core/services/cart';
import { environment } from '../../../environments/environment';

const mockUser = { id: 1, name: 'Ana García', email: 'ana@test.com', role: 'USER' as const, phone: '987654321' };

const mockProduct = {
  id: 1, name: 'Laptop', brand: 'Dell', price: 3000,
  stock: 5, images: ['laptop.jpg'], colors: [], sizes: [],
  category: 'tecnologia', description: '', isOffer: false,
};

describe('CheckoutPage', () => {
  let component: CheckoutPage;
  let fixture:   ComponentFixture<CheckoutPage>;
  let http:      HttpTestingController;
  let cart:      CartService;
  let router:    Router;

  beforeEach(async () => {
    localStorage.setItem('gh_token', 'test-token');
    localStorage.setItem('gh_user', JSON.stringify(mockUser));

    await TestBed.configureTestingModule({
      imports:   [CheckoutPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    cart   = TestBed.inject(CartService);
    router = TestBed.inject(Router);
    http   = TestBed.inject(HttpTestingController);

    cart.addToCart(mockProduct);

    fixture   = TestBed.createComponent(CheckoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    cart.clear();
    localStorage.clear();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // ── ngOnInit ──────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('redirige a /cart si el carrito está vacío', async () => {
      cart.clear();
      const navigateSpy = vi.spyOn(router, 'navigate');

      const emptyFixture = TestBed.createComponent(CheckoutPage);
      emptyFixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/cart']);
    });

    it('pre-rellena el nombre y teléfono del usuario autenticado', () => {
      expect(component.delivery.name).toBe(mockUser.name);
      expect(component.delivery.phone).toBe(mockUser.phone);
      expect(component.cardHolderName).toBe(mockUser.name);
    });

    it('inicia en el paso 1', () => {
      expect(component.step()).toBe(1);
    });
  });

  // ── nextStep / prevStep ───────────────────────────────────────────────────────

  describe('nextStep', () => {
    it('muestra error si faltan datos de entrega (paso 1)', () => {
      component.delivery.name    = '';
      component.delivery.phone   = '';
      component.delivery.address = '';
      component.nextStep();
      expect(component.error()).toBeTruthy();
      expect(component.step()).toBe(1);
    });

    it('avanza al paso 2 cuando los datos de entrega son válidos', () => {
      component.delivery.name    = 'Ana García';
      component.delivery.phone   = '987654321';
      component.delivery.address = 'Av. Lima 123';
      component.nextStep();
      expect(component.step()).toBe(2);
      expect(component.error()).toBe('');
    });

    it('muestra error si el número de tarjeta es inválido (paso 2)', () => {
      component.delivery.name    = 'Ana García';
      component.delivery.phone   = '987654321';
      component.delivery.address = 'Av. Lima 123';
      component.nextStep();

      component.paymentMethod.set('card');
      component.cardNumber  = '1234';
      component.cardExpiry  = '12/26';
      component.cardCvv     = '123';
      component.cardHolderName = 'Ana García';
      component.nextStep();

      expect(component.error()).toContain('16 dígitos');
      expect(component.step()).toBe(2);
    });

    it('muestra error si la fecha de expiración es inválida (paso 2)', () => {
      component.delivery.name    = 'Ana García';
      component.delivery.phone   = '987654321';
      component.delivery.address = 'Av. Lima 123';
      component.nextStep();

      component.paymentMethod.set('card');
      component.cardNumber     = '4111 1111 1111 1111';
      component.cardExpiry     = 'invalid';
      component.cardCvv        = '123';
      component.cardHolderName = 'Ana García';
      component.nextStep();

      expect(component.error()).toContain('MM/AA');
    });

    it('avanza al paso 3 cuando el método de pago es efectivo (sin validar tarjeta)', () => {
      component.delivery.name    = 'Ana García';
      component.delivery.phone   = '987654321';
      component.delivery.address = 'Av. Lima 123';
      component.nextStep();

      component.paymentMethod.set('cash');
      component.nextStep();

      expect(component.step()).toBe(3);
    });
  });

  describe('prevStep', () => {
    it('retrocede al paso anterior', () => {
      component.delivery.name    = 'Ana García';
      component.delivery.phone   = '987654321';
      component.delivery.address = 'Av. Lima 123';
      component.nextStep();
      expect(component.step()).toBe(2);

      component.prevStep();
      expect(component.step()).toBe(1);
    });

    it('limpia el error al retroceder', () => {
      component.delivery.name    = '';
      component.nextStep();
      expect(component.error()).toBeTruthy();

      component.prevStep();
      expect(component.error()).toBe('');
    });
  });

  // ── onCardNumberInput ─────────────────────────────────────────────────────────

  describe('onCardNumberInput', () => {
    const makeEvent = (value: string) => {
      const input = document.createElement('input');
      input.value = value;
      return { target: input } as unknown as Event;
    };

    it('formatea el número de tarjeta con espacios cada 4 dígitos', () => {
      component.onCardNumberInput(makeEvent('4111111111111111'));
      expect(component.cardNumber).toBe('4111 1111 1111 1111');
    });

    it('detecta tarjeta Visa (empieza con 4)', () => {
      component.onCardNumberInput(makeEvent('4111111111111111'));
      expect(component.cardBrand()).toBe('visa');
    });

    it('detecta tarjeta Mastercard (empieza con 51-55)', () => {
      component.onCardNumberInput(makeEvent('5234567890123456'));
      expect(component.cardBrand()).toBe('mastercard');
    });

    it('detecta tarjeta Amex (empieza con 34 o 37)', () => {
      component.onCardNumberInput(makeEvent('371234567890123'));
      expect(component.cardBrand()).toBe('amex');
    });

    it('limpia la marca para números desconocidos', () => {
      component.onCardNumberInput(makeEvent('9999999999999999'));
      expect(component.cardBrand()).toBe('');
    });
  });

  // ── cupón ─────────────────────────────────────────────────────────────────────

  describe('applyCoupon / removeCoupon', () => {
    it('no llama al servicio si el código está vacío', () => {
      component.couponCode = '   ';
      component.applyCoupon();
      http.expectNone(r => r.url.includes('/coupons'));
    });

    it('aplica el cupón correctamente', () => {
      component.couponCode = 'DESC10';
      component.applyCoupon();

      const req = http.expectOne(r => r.url.includes('/coupons/validate'));
      req.flush({ code: 'DESC10', discount: 10, discountAmount: 300, finalAmount: 2700 });

      expect(component.couponResult()?.code).toBe('DESC10');
      expect(component.applyingCoupon()).toBe(false);
    });

    it('muestra error cuando el cupón es inválido', () => {
      component.couponCode = 'INVALIDO';
      component.applyCoupon();

      http.expectOne(r => r.url.includes('/coupons/validate'))
        .flush({ message: 'Cupón expirado' }, { status: 400, statusText: 'Bad Request' });

      expect(component.couponError()).toContain('Cupón expirado');
      expect(component.couponResult()).toBeNull();
    });

    it('removeCoupon limpia el resultado y el código', () => {
      component.couponCode = 'DESC10';
      component.applyCoupon();
      http.expectOne(r => r.url.includes('/coupons/validate'))
        .flush({ code: 'DESC10', discount: 10, discountAmount: 300, finalAmount: 2700 });

      component.removeCoupon();
      expect(component.couponResult()).toBeNull();
      expect(component.couponCode).toBe('');
    });
  });

  // ── finalTotal ────────────────────────────────────────────────────────────────

  describe('finalTotal', () => {
    it('retorna el total del carrito cuando no hay cupón', () => {
      expect(component.finalTotal()).toBe(cart.total());
    });

    it('retorna el finalAmount del cupón cuando está aplicado', () => {
      component.couponCode = 'DESC10';
      component.applyCoupon();
      http.expectOne(r => r.url.includes('/coupons/validate'))
        .flush({ code: 'DESC10', discount: 10, discountAmount: 300, finalAmount: 2700 });

      expect(component.finalTotal()).toBe(2700);
    });
  });
});
