import type { Routes } from '@angular/router';
import type { RouteSeoData } from '@core/seo/seo.model';

const loadProductList = () =>
  import('./pages/product-list/product-list').then((m) => m.ProductListComponent);

export const CATALOG_ROUTES: Routes = [
  { path: 'category/:id', loadComponent: loadProductList },
  { path: 'category/:id/:subid', loadComponent: loadProductList },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'destacados',
    title: 'Productos destacados',
    data: {
      seo: { description: 'Los productos más destacados y mejor valorados de EcommerceLimo.' } satisfies RouteSeoData,
    },
    loadComponent: () => import('./pages/destacados/destacados').then((m) => m.DestacadosPage),
  },
];
