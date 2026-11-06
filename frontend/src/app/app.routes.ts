import type { Routes } from '@angular/router';
import { NO_PRELOAD } from '@core/routing/selective-preloading.strategy';

/**
 * Rutas raíz de la aplicación.
 * Cada feature expone su propio archivo de rutas y se carga de forma diferida
 * (lazy loading) para reducir el bundle inicial.
 */
export const routes: Routes = [
  { path: '', loadChildren: () => import('@features/home/home.routes').then((m) => m.HOME_ROUTES) },
  { path: '', loadChildren: () => import('@features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES) },
  { path: '', loadChildren: () => import('@features/cart/cart.routes').then((m) => m.CART_ROUTES) },
  { path: '', loadChildren: () => import('@features/checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES) },
  { path: '', loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  { path: '', loadChildren: () => import('@features/account/account.routes').then((m) => m.ACCOUNT_ROUTES) },
  { path: '', loadChildren: () => import('@features/claims/claims.routes').then((m) => m.CLAIMS_ROUTES) },
  { path: '', loadChildren: () => import('@features/support/support.routes').then((m) => m.SUPPORT_ROUTES) },
  {
    path: 'admin',
    data: NO_PRELOAD,
    loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
