import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { DestacadosPage } from './destacados';
import { FavoritesService } from '@core/services/favorites.service';
import { environment } from '@env/environment';
import type { Product } from '@core/models/product.model';

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
  loadFavorites: () => undefined,
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

  const flushFeatured = async (items = mockProducts) => {
    fixture.detectChanges();
    TestBed.tick();
    const req = http.expectOne(r => r.url === `${environment.apiUrl}/products`);
    req.flush({ items, total: items.length, page: 1, limit: 200, pages: 1 });
    await fixture.whenStable();
  };

  afterEach(() => http.verify());

  it('debería crearse correctamente', async () => {
    await flushFeatured();
    expect(component).toBeTruthy();
  });

  it('carga los productos destacados y desactiva loading', async () => {
    await flushFeatured();
    expect(component.filteredProducts().length).toBe(3);
    expect(component.loading()).toBe(false);
  });

  it('desactiva loading si ocurre un error HTTP', async () => {
    fixture.detectChanges();
    TestBed.tick();
    const req = http.expectOne(r => r.url === `${environment.apiUrl}/products`);
    req.error(new ProgressEvent('Network error'));
    await fixture.whenStable();
    expect(component.loading()).toBe(false);
  });

  it('filtra por texto de búsqueda en el nombre', async () => {
    await flushFeatured();
    component.searchText.set('zapatilla');
    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].name).toBe('Zapatilla Roja');
  });

  it('filtra por marca seleccionada', async () => {
    await flushFeatured();
    component.selectedBrand.set('Nike');
    expect(component.filteredProducts().length).toBe(2);
  });

  it('filtra por categoría seleccionada', async () => {
    await flushFeatured();
    component.selectedCategory.set('Ropa');
    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].name).toBe('Casaca Azul');
  });

  it('ordena por precio ascendente', async () => {
    await flushFeatured();
    component.sortBy.set('price-asc');
    expect(component.filteredProducts().map(p => p.price)).toEqual([50, 100, 200]);
  });

  it('ordena por precio descendente', async () => {
    await flushFeatured();
    component.sortBy.set('price-desc');
    expect(component.filteredProducts().map(p => p.price)).toEqual([200, 100, 50]);
  });

  it('ordena por nombre ascendente', async () => {
    await flushFeatured();
    component.sortBy.set('name-asc');
    expect(component.filteredProducts().map(p => p.name)).toEqual(['Casaca Azul', 'Gorra Negra', 'Zapatilla Roja']);
  });

  it('hasActiveFilters es false cuando no hay filtros activos', async () => {
    await flushFeatured();
    expect(component.hasActiveFilters()).toBe(false);
  });

  it('hasActiveFilters es true cuando hay texto de búsqueda', async () => {
    await flushFeatured();
    component.searchText.set('algo');
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('hasActiveFilters es true cuando se cambia el orden', async () => {
    await flushFeatured();
    component.sortBy.set('price-asc');
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('clearFilters restablece todos los filtros a su valor por defecto', async () => {
    await flushFeatured();
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
});
