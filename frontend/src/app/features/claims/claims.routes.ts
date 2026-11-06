import type { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import type { RouteSeoData } from '@core/seo/seo.model';

export const CLAIMS_ROUTES: Routes = [
  {
    path: 'reclamaciones',
    title: 'Libro de Reclamaciones',
    data: {
      seo: {
        description:
          'Libro de Reclamaciones virtual de EcommerceLimo conforme a la Ley N° 29571 (Código de Protección y Defensa del Consumidor).',
      } satisfies RouteSeoData,
    },
    loadComponent: () =>
      import('./pages/libro-reclamaciones/libro-reclamaciones').then((m) => m.LibroReclamacionesPage),
  },
  {
    path: 'mis-reclamaciones',
    title: 'Mis reclamaciones',
    canActivate: [authGuard],
    data: { seo: { noIndex: true } satisfies RouteSeoData },
    loadComponent: () =>
      import('./pages/mis-reclamaciones/mis-reclamaciones').then((m) => m.MisReclamacionesPage),
  },
];
