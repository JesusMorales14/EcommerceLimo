import { Injectable, signal } from '@angular/core';
import type { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private readonly KEY = 'recently_viewed';
  private readonly MAX = 10;

  private _items = signal<Product[]>([]);
  items = this._items.asReadonly();

  constructor() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) this._items.set(JSON.parse(raw));
    } catch { /* storage unavailable */ }
  }

  add(product: Product) {
    const filtered = this._items().filter(p => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, this.MAX);
    this._items.set(updated);
    try { localStorage.setItem(this.KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }

  clear() {
    this._items.set([]);
    try { localStorage.removeItem(this.KEY); } catch { /* ignore */ }
  }
}
