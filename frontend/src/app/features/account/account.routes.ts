import type { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import type { RouteSeoData } from '@core/seo/seo.model';

const PRIVATE: RouteSeoData = { noIndex: true };

export const ACCOUNT_ROUTES: Routes = [
  {
    path: 'account',
    title: 'Mi cuenta',
    canActivate: [authGuard],
    data: { seo: PRIVATE },
    loadComponent: () => import('./pages/account/account').then((m) => m.AccountPage),
  },
  {
    path: 'favorites',
    title: 'Mis favoritos',
    canActivate: [authGuard],
    data: { seo: PRIVATE },
    loadComponent: () => import('./pages/favorites/favorites').then((m) => m.FavoritesPage),
  },
];
