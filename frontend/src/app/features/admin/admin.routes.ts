import type { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin.guard';
import { authGuard } from '@core/guards/auth.guard';
import type { RouteSeoData } from '@core/seo/seo.model';

/** Panel de administración: protegido por autenticación + rol ADMIN y excluido de buscadores. */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, adminGuard],
    data: { seo: { noIndex: true } satisfies RouteSeoData },
    children: [
      {
        path: '',
        title: 'Panel de administración',
        loadComponent: () =>
          import('./dashboard/pages/admin-dashboard/admin').then((m) => m.AdminPage),
      },
      {
        path: 'products',
        title: 'Admin · Productos',
        loadComponent: () =>
          import('./products/pages/admin-products/admin-products').then((m) => m.AdminProductsPage),
      },
      {
        path: 'orders',
        title: 'Admin · Pedidos',
        loadComponent: () =>
          import('./orders/pages/admin-orders/admin-orders').then((m) => m.AdminOrdersPage),
      },
      {
        path: 'users',
        title: 'Admin · Usuarios',
        loadComponent: () =>
          import('./users/pages/admin-users/admin-users').then((m) => m.AdminUsersPage),
      },
      {
        path: 'coupons',
        title: 'Admin · Cupones',
        loadComponent: () =>
          import('./coupons/pages/admin-coupons/admin-coupons').then((m) => m.AdminCouponsPage),
      },
      {
        path: 'deals',
        title: 'Admin · Ofertas del día',
        loadComponent: () =>
          import('./deals/pages/admin-deals/admin-deals').then((m) => m.AdminDealsPage),
      },
      {
        path: 'reclamaciones',
        title: 'Admin · Reclamaciones',
        loadComponent: () =>
          import('./claims/pages/admin-reclamaciones/admin-reclamaciones').then(
            (m) => m.AdminReclamacionesPage,
          ),
      },
    ],
  },
];
