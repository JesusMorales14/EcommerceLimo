import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { ProductListComponent } from './pages/product-list/product-list';
import { ProductDetailComponent } from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';

export const routes: Routes = [
  {
    path: '',
    component: Inicio
  },
  {
    path: 'category/:id',
    component: ProductListComponent
  },
  {
    path: 'category/:id/:subid',
    component: ProductListComponent
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent
  },
  { path: 'cart',
    component: Cart
  },
  { path: 'product/:id',
    component: ProductDetailComponent
  },
];
