import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import type { Product } from '@core/models/product.model';
import { CartService } from '@core/services/cart.service';
import { FavoritesService } from '@core/services/favorites.service';
import { ProductCard } from './product-card';

const PRODUCT: Product = {
  id: 7, name: 'Zapatilla', brand: 'Nike', description: 'Running', price: 200, discount: 25, stock: 4,
  images: ['a.jpg', 'b.jpg'], colors: [], sizes: [], category: 'deporte', isOffer: true,
};

describe('ProductCard', () => {
  const favoriteIds = signal<number[]>([]);
  const favorites = { favoriteIds, toggle: vi.fn() };

  const render = (product: Product = PRODUCT) => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    localStorage.clear();
    favoriteIds.set([]);
    favorites.toggle.mockReset();
    TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [provideRouter([]), { provide: FavoritesService, useValue: favorites }],
    });
  });

  it('muestra precio con descuento y precio anterior', () => {
    const { el } = render();
    expect(el.querySelector('.price-now')!.textContent).toContain('150');
    expect(el.querySelector('.price-old')!.textContent).toContain('200');
    expect(el.querySelector('.badge-off')!.textContent).toContain('-25%');
  });

  it('el título enlaza al detalle del producto', () => {
    const { el } = render();
    expect(el.querySelector('.card-name a')!.getAttribute('href')).toBe('/product/7');
  });

  it('agrega el producto al carro', () => {
    const { el } = render();
    el.querySelector<HTMLButtonElement>('.btn-add')!.click();
    expect(TestBed.inject(CartService).count()).toBe(1);
  });

  it('alterna favoritos y refleja el estado con aria-pressed', () => {
    const { fixture, el } = render();
    const wish = el.querySelector<HTMLButtonElement>('.btn-wish')!;
    wish.click();
    expect(favorites.toggle).toHaveBeenCalledWith(PRODUCT);

    favoriteIds.set([7]);
    fixture.detectChanges();
    expect(wish.getAttribute('aria-pressed')).toBe('true');
  });

  it('muestra "Sin stock" y oculta el botón de compra si no hay unidades', () => {
    const { el } = render({ ...PRODUCT, stock: 0 });
    expect(el.querySelector('.out-of-stock')).toBeTruthy();
    expect(el.querySelector('.btn-add')).toBeNull();
  });
});
