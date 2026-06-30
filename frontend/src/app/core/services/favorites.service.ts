import { inject, Injectable, signal, computed } from '@angular/core';
import type { Product } from '../models/product.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  private _ids   = signal<number[]>([]);
  private _items = signal<Product[]>([]);

  favoriteIds   = this._ids.asReadonly();
  favoriteItems = this._items.asReadonly();
  count         = computed(() => this._ids().length);

  loadFavorites() {
    if (!this.auth.isLoggedIn()) return;
    this.api.get<number[]>('/favorites/ids').subscribe(ids => this._ids.set(ids));
    this.api.get<Product[]>('/favorites').subscribe(items => this._items.set(items));
  }

  isFavorite(productId: number) {
    return this._ids().includes(productId);
  }

  toggle(product: Product) {
    if (!this.auth.isLoggedIn()) return;
    this.api.post<{ favorited: boolean; productId: number }>(`/favorites/${product.id}`, {})
      .subscribe(res => {
        if (res.favorited) {
          this._ids.update(ids => [...ids, res.productId]);
          this._items.update(items => [...items, product]);
        } else {
          this._ids.update(ids => ids.filter(id => id !== res.productId));
          this._items.update(items => items.filter(p => p.id !== res.productId));
        }
      });
  }
}
