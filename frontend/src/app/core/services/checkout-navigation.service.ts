import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const CHECKOUT_PATH = '/checkout';

/**
 * Encapsula la navegación hacia el checkout: si el usuario no ha iniciado sesión
 * lo envía al login indicando a dónde volver luego.
 */
@Injectable({ providedIn: 'root' })
export class CheckoutNavigationService {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  goToCheckout(): void {
    if (this.auth.isLoggedIn()) {
      void this.router.navigateByUrl(CHECKOUT_PATH);
      return;
    }
    void this.router.navigate(['/login'], { state: { redirect: CHECKOUT_PATH } });
  }
}
