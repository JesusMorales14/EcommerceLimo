import type { Routes } from '@angular/router';
import type { RouteSeoData } from '@core/seo/seo.model';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Tienda online de tecnología, moda y hogar',
    data: {
      seo: {
        description:
          'Compra online en EcommerceLimo: tecnología, electrodomésticos, moda, hogar y más con envío gratis y pago seguro.',
      } satisfies RouteSeoData,
    },
    loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
  },
];
