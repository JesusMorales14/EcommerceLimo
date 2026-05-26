import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio) },
  {
    path: 'category/:id',
    loadComponent: () =>
      import('./pages/product-list/product-list').then((m) => m.ProductListComponent),
  },
  {
    path: 'category/:id/:subid',
    loadComponent: () =>
      import('./pages/product-list/product-list').then((m) => m.ProductListComponent),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetailComponent),
  },
  { path: 'cart', loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart) },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.CheckoutPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then((m) => m.RegisterPage),
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/account/account').then((m) => m.AccountPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin/admin').then((m) => m.AdminPage),
  },
  {
    path: 'admin/products',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin/products/admin-products').then((m) => m.AdminProductsPage),
  },
  {
    path: 'admin/orders',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin/orders/admin-orders').then((m) => m.AdminOrdersPage),
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin/users/admin-users').then((m) => m.AdminUsersPage),
  },
  {
    path: 'admin/coupons',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin/coupons/admin-coupons').then((m) => m.AdminCouponsPage),
  },
  {
    path: 'admin/deals',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/admin/deals/admin-deals').then((m) => m.AdminDealsPage),
  },
  {
    path: 'favorites',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/favorites/favorites').then((m) => m.FavoritesPage),
  },
  { path: 'info', loadComponent: () => import('./pages/search/search').then((m) => m.SearchPage) },
  {
    path: 'centro-ayuda',
    loadComponent: () => import('./pages/centro-ayuda/centro-ayuda').then((m) => m.CentroAyudaPage),
  },
  {
    path: 'politica-envio',
    loadComponent: () =>
      import('./pages/politica-envio/politica-envio').then((m) => m.PoliticaEnvioPage),
  },
  {
    path: 'terminos',
    loadComponent: () => import('./pages/terminos/terminos').then((m) => m.TerminosPage),
  },
  {
    path: 'privacidad',
    loadComponent: () =>
      import('./pages/politica-privacidad/politica-privacidad').then(
        (m) => m.PoliticaPrivacidadPage,
      ),
  },
  {
    path: 'reclamaciones',
    loadComponent: () =>
      import('./pages/libro-reclamaciones/libro-reclamaciones').then(
        (m) => m.LibroReclamacionesPage,
      ),
  },
  {
    path: 'mis-reclamaciones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/mis-reclamaciones/mis-reclamaciones').then((m) => m.MisReclamacionesPage),
  },
  {
    path: 'admin/reclamaciones',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./pages/admin/reclamaciones/admin-reclamaciones').then(
        (m) => m.AdminReclamacionesPage,
      ),
  },
  { path: '**', redirectTo: '' },
];
