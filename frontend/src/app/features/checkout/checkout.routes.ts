import type { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import type { RouteSeoData } from '@core/seo/seo.model';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: 'checkout',
    title: 'Finalizar compra',
    canActivate: [authGuard],
    data: { seo: { noIndex: true } satisfies RouteSeoData },
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.CheckoutPage),
  },
];
