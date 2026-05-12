import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  isOpen = signal(false);
  count  = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  total  = computed(() => this._items().reduce((sum, i) => sum + this.itemPrice(i) * i.quantity, 0));

  getItems() { return this._items; }

  itemPrice(item: CartItem): number {
    const p = item.product;
    return p.discount ? p.price * (1 - p.discount / 100) : p.price;
  }

  addToCart(product: Product, qty = 1) {
    this._items.update(list => {
      const idx = list.findIndex(i => i.product.id === product.id);
      if (idx >= 0) {
        const updated = [...list];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
        return updated;
      }
      return [...list, { product, quantity: qty }];
    });
    this.isOpen.set(true);
  }

  updateQty(productId: number, qty: number) {
    if (qty <= 0) { this.removeFromCart(productId); return; }
    this._items.update(list =>
      list.map(i => i.product.id === productId ? { ...i, quantity: qty } : i)
    );
  }

  removeFromCart(productId: number) {
    this._items.update(list => list.filter(i => i.product.id !== productId));
  }

  clear() { this._items.set([]); }

  openCart()  { this.isOpen.set(true);  }
  closeCart() { this.isOpen.set(false); }
}
