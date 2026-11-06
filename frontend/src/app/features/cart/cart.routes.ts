import type { Routes } from '@angular/router';
import type { RouteSeoData } from '@core/seo/seo.model';

export const CART_ROUTES: Routes = [
  {
    path: 'cart',
    title: 'Mi carro de compras',
    data: { seo: { noIndex: true } satisfies RouteSeoData },
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
  },
];
