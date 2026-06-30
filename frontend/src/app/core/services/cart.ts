import { Injectable, signal, computed } from '@angular/core';
import type { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedImageUrl?: string;
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

  addToCart(product: Product, qty = 1, selectedColor?: string, selectedImageUrl?: string) {
    this._items.update(list => {
      const idx = list.findIndex(i => i.product.id === product.id && i.selectedColor === selectedColor);
      if (idx >= 0) {
        const updated = [...list];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty, selectedColor, selectedImageUrl };
        return updated;
      }
      return [...list, { product, quantity: qty, selectedColor, selectedImageUrl }];
    });
    this.isOpen.set(true);
  }

  updateQty(productId: number, qty: number, selectedColor?: string) {
    if (qty <= 0) { this.removeFromCart(productId, selectedColor); return; }
    this._items.update(list =>
      list.map(i => i.product.id === productId && i.selectedColor === selectedColor ? { ...i, quantity: qty } : i)
    );
  }

  removeFromCart(productId: number, selectedColor?: string) {
    this._items.update(list => list.filter(i => !(i.product.id === productId && i.selectedColor === selectedColor)));
  }

  clear() { this._items.set([]); }

  openCart()  { this.isOpen.set(true);  }
  closeCart() { this.isOpen.set(false); }
}
