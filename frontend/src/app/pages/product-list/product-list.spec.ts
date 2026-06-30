import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ProductListComponent } from './product-list';
import { FavoritesService } from '../../core/services/favorites.service';

const mockProducts = [
  { id: 1, name: 'Laptop A', price: 3000, images: [], colors: [], sizes: [], category: 'tecnologia', subCategory: 'laptops' },
  { id: 2, name: 'Laptop B', price: 1500, images: [], colors: [], sizes: [], category: 'tecnologia', subCategory: 'laptops' },
  { id: 3, name: 'Laptop C', price: 4500, images: [], colors: [], sizes: [], category: 'tecnologia', subCategory: 'laptops' },
];

const fakeFavService = {
  isFav:       () => false,
  toggle:      () => {},
  favIds:      signal<number[]>([]),
  favoriteIds: signal<number[]>([]),
};

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture:   ComponentFixture<ProductListComponent>;
  let http:      HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:   [ProductListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FavoritesService, useValue: fakeFavService },
        {
          provide: ActivatedRoute,
          useValue: {
            params:      of({ id: 'tecnologia' }),
            queryParams: of({}),
            snapshot:    { paramMap: { get: () => 'tecnologia' }, queryParamMap: { get: () => null } },
          },
        },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    http      = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  const flushProducts = (items = mockProducts) => {
    const req = http.expectOne(r => r.url.includes('/products'));
    req.flush({ items, total: items.length });
  };

  it('debería crearse correctamente', () => {
    flushProducts();
    expect(component).toBeTruthy();
  });

  it('inicia con loading en true', () => {
    expect(component.loading()).toBe(true);
    flushProducts();
  });

  it('carga los productos al iniciar', () => {
    flushProducts(mockProducts);
    expect(component.baseProducts()).toHaveLength(3);
    expect(component.loading()).toBe(false);
  });

  describe('filteredProducts (computed)', () => {
    it('ordena por precio ascendente', () => {
      flushProducts(mockProducts);
      component.sortBy.set('price-asc');
      const sorted = component.filteredProducts();
      expect(sorted[0].price).toBe(1500);
      expect(sorted[2].price).toBe(4500);
    });

    it('ordena por precio descendente', () => {
      flushProducts(mockProducts);
      component.sortBy.set('price-desc');
      const sorted = component.filteredProducts();
      expect(sorted[0].price).toBe(4500);
      expect(sorted[2].price).toBe(1500);
    });

    it('retorna el orden de relevancia por defecto', () => {
      flushProducts(mockProducts);
      component.sortBy.set('relevance');
      expect(component.filteredProducts()).toHaveLength(3);
    });
  });

  describe('paginación', () => {
    it('inicia en la página 1', () => {
      flushProducts();
      expect(component.page()).toBe(1);
    });
  });
});
