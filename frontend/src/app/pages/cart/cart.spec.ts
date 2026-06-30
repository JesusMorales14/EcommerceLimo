import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { Cart } from './cart';
import { CartService } from '../../core/services/cart';
import { AuthService } from '../../core/services/auth.service';

const mockItem = { id: 1, name: 'Laptop Test', price: 3000, quantity: 1, images: [] };

const makeCartSvc = (items: any[] = []) => ({
  getItems: () => signal(items),
  removeItem: vi.fn(),
  clearCart:  vi.fn(),
  increment:  vi.fn(),
  decrement:  vi.fn(),
  total:      signal(items.reduce((s, i) => s + i.price * i.quantity, 0)),
});

const makeAuthSvc = (loggedIn: boolean) => ({
  isLoggedIn: () => loggedIn,
  user:       signal(loggedIn ? { id: 1, name: 'Test' } : null),
  getToken:   () => loggedIn ? 'tok' : null,
  logout:     vi.fn(),
});

const build = async (items: any[] = [], loggedIn = true) => {
  await TestBed.configureTestingModule({
    imports:   [Cart],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: CartService, useValue: makeCartSvc(items)       },
      { provide: AuthService, useValue: makeAuthSvc(loggedIn)   },
    ],
  }).compileComponents();

  const fixture   = TestBed.createComponent(Cart);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  return { fixture, component, router: TestBed.inject(Router) };
};

describe('Cart (página)', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('debería crearse correctamente', async () => {
    const { component } = await build();
    expect(component).toBeTruthy();
  });

  it('items retorna arreglo vacío si el carrito está vacío', async () => {
    const { component } = await build([]);
    expect(component.items).toHaveLength(0);
  });

describe('checkout', () => {
    it('navega a /checkout si el usuario está autenticado', async () => {
      const { component, router } = await build([], true);
      const spy = vi.spyOn(router, 'navigate');
      component.checkout();
      expect(spy).toHaveBeenCalledWith(['/checkout']);
    });

    it('navega a /login con redirect si el usuario no está autenticado', async () => {
      const { component, router } = await build([], false);
      const spy = vi.spyOn(router, 'navigate');
      component.checkout();
      expect(spy).toHaveBeenCalledWith(
        ['/login'],
        expect.objectContaining({ state: { redirect: '/checkout' } }),
      );
    });

    it('no navega a /checkout cuando el usuario no está autenticado', async () => {
      const { component, router } = await build([], false);
      const spy = vi.spyOn(router, 'navigate');
      component.checkout();
      expect(spy).not.toHaveBeenCalledWith(['/checkout']);
    });
  });
});
