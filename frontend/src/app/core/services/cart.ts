import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../mocks/products.mock';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<Product[]>([]);

  count = computed(() => this.cartItems().length);

  addToCart(product: Product) {
    this.cartItems.update(items => [...items, product]);
    console.log('¡Producto agregado!', product.name);
  }

  getItems() {
    return this.cartItems;
  }
}
