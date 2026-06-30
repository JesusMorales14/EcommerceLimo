import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  function setup(isLoggedIn: boolean) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn: () => isLoggedIn } },
      ],
    });
  }

  it('retorna true si el usuario está logueado', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );
    expect(result).toBe(true);
  });

  it('redirige a /login si el usuario no está logueado', () => {
    setup(false);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    ) as UrlTree;

    const router = TestBed.inject(Router);
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result)).toBe('/login');
  });
});
