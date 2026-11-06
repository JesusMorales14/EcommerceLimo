import { computed, effect, Injectable, signal } from '@angular/core';
import type { CartItem } from '../models/cart.model';
import type { Product } from '../models/product.model';
import { discountedPrice } from '@shared/utils/pricing';

export type { CartItem } from '../models/cart.model';

const STORAGE_KEY = 'cart_items';

const isSameLine = (item: CartItem, productId: number, color?: string) =>
  item.product.id === productId && item.selectedColor === color;

/**
 * Estado del carro de compras (patrón Store con signals).
 * Persiste en localStorage para conservar el carro entre sesiones.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.restore());

  readonly items = this._items.asReadonly();
  readonly isOpen = signal(false);
  readonly isEmpty = computed(() => this._items().length === 0);
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly total = computed(() =>
    this._items().reduce((sum, i) => sum + this.itemPrice(i) * i.quantity, 0),
  );

  constructor() {
    effect(() => this.persist(this._items()));
  }

  /** Precio unitario final de una línea (con descuento aplicado). */
  itemPrice(item: CartItem): number {
    return discountedPrice(item.product);
  }

  addToCart(product: Product, qty = 1, selectedColor?: string, selectedImageUrl?: string): void {
    this._items.update((list) => {
      const existing = list.find((i) => isSameLine(i, product.id, selectedColor));
      if (!existing) return [...list, { product, quantity: qty, selectedColor, selectedImageUrl }];
      return list.map((i) =>
        i === existing ? { ...i, quantity: i.quantity + qty, selectedImageUrl } : i,
      );
    });
    this.isOpen.set(true);
  }

  updateQty(productId: number, qty: number, selectedColor?: string): void {
    if (qty <= 0) {
      this.removeFromCart(productId, selectedColor);
      return;
    }
    this._items.update((list) =>
      list.map((i) => (isSameLine(i, productId, selectedColor) ? { ...i, quantity: qty } : i)),
    );
  }

  removeFromCart(productId: number, selectedColor?: string): void {
    this._items.update((list) => list.filter((i) => !isSameLine(i, productId, selectedColor)));
  }

  clear(): void {
    this._items.set([]);
  }

  openCart(): void {
    this.isOpen.set(true);
  }

  closeCart(): void {
    this.isOpen.set(false);
  }

  private restore(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  private persist(items: CartItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible */
    }
  }
}
