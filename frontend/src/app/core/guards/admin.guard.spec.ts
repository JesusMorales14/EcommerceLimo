import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  function setup(isAdmin: boolean) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAdmin: () => isAdmin } },
      ],
    });
  }

  it('retorna true si el usuario es administrador', () => {
    setup(true);
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any)
    );
    expect(result).toBe(true);
  });

  it('redirige a / si el usuario no es administrador', () => {
    setup(false);
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, {} as any)
    ) as UrlTree;

    const router = TestBed.inject(Router);
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result)).toBe('/');
  });
});
