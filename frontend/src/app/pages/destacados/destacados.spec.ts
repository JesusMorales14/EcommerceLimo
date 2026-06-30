import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { DestacadosPage } from './destacados';
import { FavoritesService } from '../../core/services/favorites.service';
import { CartService } from '../../core/services/cart';
import { environment } from '../../../environments/environment';
import { Product } from '../../core/models/product.model';

const mockProducts: Product[] = [
  { id: 1, name: 'Zapatilla Roja', description: 'desc', price: 100, discount: 10, stock: 5, brand: 'Nike', category: 'Calzado', isOffer: true, images: [], colors: [], sizes: [] },
  { id: 2, name: 'Casaca Azul', description: 'desc', price: 200, stock: 5, brand: 'Adidas', category: 'Ropa', isOffer: false, images: [], colors: [], sizes: [] },
  { id: 3, name: 'Gorra Negra', description: 'desc', price: 50, stock: 5, brand: 'Nike', category: 'Accesorios', isOffer: false, images: [], colors: [], sizes: [] },
];

// Mock de FavoritesService para evitar que AuthService acceda a localStorage en la construcción
const favIds = signal<number[]>([]);
const fakeFavService = {
  favoriteIds:   favIds.asReadonly(),
  favoriteItems: signal<Product[]>([]).asReadonly(),
  count:         signal(0).asReadonly(),
  isFavorite:    (id: number) => favIds().includes(id),
  toggle:        (p: Product) => {
    if (favIds().includes(p.id)) {
      favIds.update(ids => ids.filter(i => i !== p.id));
    } else {
      favIds.update(ids => [...ids, p.id]);
    }
  },
  loadFavorites: () => {},
};

describe('DestacadosPage', () => {
  let component: DestacadosPage;
  let fixture: ComponentFixture<DestacadosPage>;
  let http: HttpTestingController;

  beforeEach(async () => {
    favIds.set([]);

    await TestBed.configureTestingModule({
      imports: [DestacadosPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FavoritesService, useValue: fakeFavService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DestacadosPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  const flushFeatured = (items = mockProducts) => {
    fixture.detectChanges();
    const req = http.expectOne(r => r.url === `${environment.apiUrl}/products`);
    req.flush({ items, total: items.length, page: 1, limit: 200, pages: 1 });
  };

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    flushFeatured();
    expect(component).toBeTruthy();
  });

  it('carga los productos destacados y desactiva loading', () => {
    flushFeatured();
    expect(component.filteredProducts().length).toBe(3);
    expect(component.loading()).toBe(false);
  });

  it('desactiva loading si ocurre un error HTTP', () => {
    fixture.detectChanges();
    const req = http.expectOne(r => r.url === `${environment.apiUrl}/products`);
    req.error(new ErrorEvent('Network error'));
    expect(component.loading()).toBe(false);
  });

  it('filtra por texto de búsqueda en el nombre', () => {
    flushFeatured();
    component.searchText.set('zapatilla');
    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].name).toBe('Zapatilla Roja');
  });

  it('filtra por marca seleccionada', () => {
    flushFeatured();
    component.selectedBrand.set('Nike');
    expect(component.filteredProducts().length).toBe(2);
  });

  it('filtra por categoría seleccionada', () => {
    flushFeatured();
    component.selectedCategory.set('Ropa');
    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].name).toBe('Casaca Azul');
  });

  it('ordena por precio ascendente', () => {
    flushFeatured();
    component.sortBy.set('price-asc');
    expect(component.filteredProducts().map(p => p.price)).toEqual([50, 100, 200]);
  });

  it('ordena por precio descendente', () => {
    flushFeatured();
    component.sortBy.set('price-desc');
    expect(component.filteredProducts().map(p => p.price)).toEqual([200, 100, 50]);
  });

  it('ordena por nombre ascendente', () => {
    flushFeatured();
    component.sortBy.set('name-asc');
    expect(component.filteredProducts().map(p => p.name)).toEqual(['Casaca Azul', 'Gorra Negra', 'Zapatilla Roja']);
  });

  it('hasActiveFilters es false cuando no hay filtros activos', () => {
    flushFeatured();
    expect(component.hasActiveFilters()).toBe(false);
  });

  it('hasActiveFilters es true cuando hay texto de búsqueda', () => {
    flushFeatured();
    component.searchText.set('algo');
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('hasActiveFilters es true cuando se cambia el orden', () => {
    flushFeatured();
    component.sortBy.set('price-asc');
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('clearFilters restablece todos los filtros a su valor por defecto', () => {
    flushFeatured();
    component.searchText.set('algo');
    component.selectedBrand.set('Nike');
    component.selectedCategory.set('Ropa');
    component.sortBy.set('price-asc');
    component.clearFilters();
    expect(component.searchText()).toBe('');
    expect(component.selectedBrand()).toBe('');
    expect(component.selectedCategory()).toBe('');
    expect(component.sortBy()).toBe('relevance');
  });

  it('discountedPrice calcula el precio con descuento', () => {
    flushFeatured();
    expect(component.discountedPrice(mockProducts[0])).toBe(90);
  });

  it('discountedPrice retorna el precio original cuando no hay descuento', () => {
    flushFeatured();
    expect(component.discountedPrice(mockProducts[1])).toBe(200);
  });

  it('addToCart agrega el producto al carrito', () => {
    flushFeatured();
    const cartService = TestBed.inject(CartService);
    component.addToCart(mockProducts[0]);
    expect(cartService.getItems()().length).toBeGreaterThan(0);
  });

  it('toggleFav alterna el favorito y detiene la propagación del evento', () => {
    flushFeatured();
    const event = new Event('click', { cancelable: true });
    const stopSpy = vi.spyOn(event, 'stopPropagation');
    component.toggleFav(mockProducts[0], event);
    expect(stopSpy).toHaveBeenCalled();
    expect(fakeFavService.isFavorite(mockProducts[0].id)).toBe(true);
  });
});
