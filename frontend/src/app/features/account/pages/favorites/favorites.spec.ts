import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Product } from '@core/models/product.model';
import { FavoritesService } from '@core/services/favorites.service';
import { FavoritesPage } from './favorites';

const PRODUCT = { id: 1, name: 'Lámpara', brand: 'Glow', price: 80, stock: 2, images: [], colors: [], sizes: [] } as unknown as Product;

describe('FavoritesPage', () => {
  const items = signal<Product[]>([]);

  const render = () => {
    const fixture = TestBed.createComponent(FavoritesPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    items.set([]);
    TestBed.configureTestingModule({
      imports: [FavoritesPage],
      providers: [
        provideRouter([]),
        { provide: FavoritesService, useValue: { favoriteItems: items, favoriteIds: signal([1]), toggle: () => undefined } },
      ],
    });
  });

  it('muestra el estado vacío sin favoritos', () => {
    const el = render();
    expect(el.querySelector('.empty-state')).toBeTruthy();
    expect(el.querySelector('h1')!.textContent).toContain('(0)');
  });

  it('lista los favoritos con la tarjeta de producto compartida', () => {
    items.set([PRODUCT]);
    const el = render();
    expect(el.querySelectorAll('app-product-card')).toHaveLength(1);
    expect(el.querySelector('.btn-wish')!.getAttribute('aria-pressed')).toBe('true');
  });
});
