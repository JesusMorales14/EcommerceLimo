import type { Routes } from '@angular/router';
import type { RouteSeoData } from '@core/seo/seo.model';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión',
    data: { seo: { noIndex: true } satisfies RouteSeoData },
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    title: 'Crear cuenta',
    data: { seo: { noIndex: true } satisfies RouteSeoData },
    loadComponent: () => import('./pages/register/register').then((m) => m.RegisterPage),
  },
];
