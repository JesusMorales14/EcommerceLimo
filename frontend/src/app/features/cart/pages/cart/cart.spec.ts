import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import type { Product } from '@core/models/product.model';
import { CartService } from '@core/services/cart.service';
import { CheckoutNavigationService } from '@core/services/checkout-navigation.service';
import { Cart } from './cart';

const PRODUCT: Product = {
  id: 1, name: 'Laptop Test', brand: 'Dell', price: 3000, discount: 10, stock: 3, images: ['a.jpg'],
  colors: [], sizes: [], category: 'tecnologia', description: '', isOffer: false,
};

describe('Cart (página)', () => {
  let cart: CartService;

  const render = () => {
    const fixture = TestBed.createComponent(Cart);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Cart],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    cart = TestBed.inject(CartService);
  });

  it('muestra el estado vacío cuando no hay productos', () => {
    const { el } = render();
    expect(el.querySelector('.empty-state')).toBeTruthy();
    expect(el.querySelector('h1')!.textContent).toContain('0 productos');
  });

  it('lista los productos y el resumen', () => {
    cart.addToCart(PRODUCT, 2);
    const { el } = render();
    expect(el.querySelectorAll('app-cart-item')).toHaveLength(1);
    expect(el.querySelector('h1')!.textContent).toContain('1 producto');
    expect(el.querySelector('app-cart-summary')).toBeTruthy();
  });

  it('el botón + incrementa la cantidad', () => {
    cart.addToCart(PRODUCT);
    const { fixture, el } = render();
    el.querySelector<HTMLButtonElement>('[aria-label="Agregar una unidad"]')!.click();
    fixture.detectChanges();
    expect(cart.items()[0].quantity).toBe(2);
  });

  it('el botón Eliminar quita el producto', () => {
    cart.addToCart(PRODUCT);
    const { fixture, el } = render();
    el.querySelector<HTMLButtonElement>('.action-btn.delete')!.click();
    fixture.detectChanges();
    expect(cart.isEmpty()).toBe(true);
    expect(el.querySelector('.empty-state')).toBeTruthy();
  });

  it('el resumen delega la navegación al checkout', () => {
    cart.addToCart(PRODUCT);
    const spy = vi.spyOn(TestBed.inject(CheckoutNavigationService), 'goToCheckout').mockImplementation(() => undefined);
    const { el } = render();
    el.querySelector<HTMLButtonElement>('.btn-checkout')!.click();
    expect(spy).toHaveBeenCalled();
  });
});
