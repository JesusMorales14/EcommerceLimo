import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { CartService } from '@core/services/cart.service';
import { LeafletLoaderService } from '../../services/leaflet-loader.service';
import { CheckoutPage } from './checkout';

const mockUser = { id: 1, name: 'Ana García', email: 'ana@test.com', role: 'USER' as const, phone: '987654321' };
const mockProduct = {
  id: 1, name: 'Laptop', brand: 'Dell', price: 3000, stock: 5, images: ['laptop.jpg'],
  colors: [], sizes: [], category: 'tecnologia', description: '', isOffer: false,
};

describe('CheckoutPage', () => {
  let fixture: ComponentFixture<CheckoutPage>;
  let el: HTMLElement;
  let cart: CartService;
  let router: Router;
  let http: HttpTestingController;

  const create = () => {
    fixture = TestBed.createComponent(CheckoutPage);
    el = fixture.nativeElement;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('gh_token', 'test-token');
    localStorage.setItem('gh_user', JSON.stringify(mockUser));

    await TestBed.configureTestingModule({
      imports: [CheckoutPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        // El mapa no se renderiza en jsdom: el cargador nunca resuelve.
        { provide: LeafletLoaderService, useValue: { load: () => new Promise(() => undefined) } },
      ],
    }).compileComponents();

    cart = TestBed.inject(CartService);
    router = TestBed.inject(Router);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('redirige a /cart si el carro está vacío', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    create();
    expect(navigateSpy).toHaveBeenCalledWith(['/cart']);
  });

  describe('con productos en el carro', () => {
    beforeEach(() => {
      cart.addToCart(mockProduct);
      create();
    });

    it('inicia en el paso de entrega con los datos del usuario precargados', async () => {
      await fixture.whenStable();
      expect(el.querySelector('app-delivery-step')).toBeTruthy();
      expect(el.querySelector<HTMLInputElement>('#delivery-name')!.value).toBe('Ana García');
      expect(el.querySelector('[aria-current="step"]')!.textContent).toContain('Entrega');
    });

    it('muestra un error si se intenta avanzar sin dirección', () => {
      el.querySelector<HTMLButtonElement>('.step-footer .btn-primary')!.click();
      fixture.detectChanges();
      expect(el.querySelector('.checkout-error')!.textContent).toContain('Completa');
    });

    it('avanza al paso de pago cuando la entrega es válida', () => {
      const address = el.querySelector<HTMLInputElement>('#delivery-address')!;
      address.value = 'Av. Larco 123';
      address.dispatchEvent(new Event('input'));
      el.querySelector<HTMLButtonElement>('.step-footer .btn-primary')!.click();
      fixture.detectChanges();
      expect(el.querySelector('app-payment-step')).toBeTruthy();
    });
  });
});
