import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import type { Product } from '../models/product.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

interface ToggleFavoriteResponse {
  favorited: boolean;
  productId: number;
}

/**
 * Favoritos del usuario autenticado. Se sincroniza automáticamente con la
 * sesión: carga los favoritos al iniciar sesión y los limpia al cerrarla.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly _items = signal<Product[]>([]);

  readonly favoriteItems = this._items.asReadonly();
  readonly favoriteIds = computed(() => this._items().map((product) => product.id));
  readonly count = computed(() => this._items().length);

  constructor() {
    effect(() => {
      const loggedIn = this.auth.isLoggedIn();
      untracked(() => (loggedIn ? this.loadFavorites() : this._items.set([])));
    });
  }

  loadFavorites(): void {
    if (!this.auth.isLoggedIn()) return;
    this.api.get<Product[]>('/favorites').subscribe((items) => this._items.set(items));
  }

  isFavorite(productId: number): boolean {
    return this.favoriteIds().includes(productId);
  }

  /** Agrega o quita un favorito. Si no hay sesión, lleva al login y vuelve luego. */
  toggle(product: Product): void {
    if (!this.auth.isLoggedIn()) {
      void this.router.navigate(['/login'], { state: { redirect: this.router.url } });
      return;
    }
    this.api.post<ToggleFavoriteResponse>(`/favorites/${product.id}`, {}).subscribe(({ favorited, productId }) =>
      this._items.update((items) =>
        favorited ? [...items, product] : items.filter((item) => item.id !== productId),
      ),
    );
  }
}
