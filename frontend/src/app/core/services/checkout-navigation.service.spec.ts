import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { CheckoutNavigationService } from './checkout-navigation.service';

describe('CheckoutNavigationService', () => {
  const setup = (loggedIn: boolean) => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isLoggedIn: signal(loggedIn) } }],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    return { service: TestBed.inject(CheckoutNavigationService), router };
  };

  it('navega al checkout si hay sesión', () => {
    const { service, router } = setup(true);
    service.goToCheckout();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/checkout');
  });

  it('redirige al login recordando el destino si no hay sesión', () => {
    const { service, router } = setup(false);
    service.goToCheckout();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { state: { redirect: '/checkout' } });
  });
});
