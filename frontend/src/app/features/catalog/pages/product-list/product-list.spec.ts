import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { CategoryService } from '@core/services/category.service';
import { ProductListComponent } from './product-list';

const PRODUCTS = [
  { id: 1, name: 'Laptop A', brand: 'X', price: 3000, stock: 1, images: [], colors: [], sizes: [], category: 'tecnologia' },
  { id: 2, name: 'Laptop B', brand: 'X', price: 1500, stock: 1, images: [], colors: [], sizes: [], category: 'tecnologia' },
  { id: 3, name: 'Laptop C', brand: 'X', price: 4500, stock: 0, images: [], colors: [], sizes: [], category: 'tecnologia' },
];
const CATEGORIES = [
  { id: 'tecnologia', label: 'Tecnología', icon: 'devices', desc: 'Gadgets', subCategories: [{ id: 'laptops', label: 'Laptops' }] },
];

describe('ProductListComponent', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const render = async (id = 'tecnologia', subid?: string) => {
    fixture = TestBed.createComponent(ProductListComponent);
    fixture.componentRef.setInput('id', id);
    if (subid) fixture.componentRef.setInput('subid', subid);
    el = fixture.nativeElement;
    fixture.detectChanges();
    TestBed.tick();
  };

  const flush = async (pages = 1) => {
    http.expectOne((r) => r.url.includes('/products')).flush({ items: PRODUCTS, total: 3, page: 1, limit: 40, pages });
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: CategoryService,
          useValue: {
            categories: signal(CATEGORIES),
            findById: (id: string) => CATEGORIES.find((c) => c.id === id),
          },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('muestra un estado de carga y luego las tarjetas de producto', async () => {
    await render();
    expect(el.querySelector('.loading-state')).toBeTruthy();
    await flush();
    expect(el.querySelectorAll('app-product-card')).toHaveLength(3);
    expect(el.querySelector('.cat-hero-count')!.textContent).toContain('3 productos');
  });

  it('usa la etiqueta de la categoría y subcategoría como título SEO', async () => {
    await render('tecnologia', 'laptops');
    const req = http.expectOne((r) => r.url.includes('/products'));
    expect(req.request.params.get('subCategory')).toBe('laptops');
    req.flush({ items: [], total: 0, page: 1, limit: 40, pages: 1 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('h1')!.textContent).toContain('Laptops');
    expect(TestBed.inject(Title).getTitle()).toContain('Laptops');
  });

  it('ordena por precio al cambiar el selector', async () => {
    await render();
    await flush();
    const select = el.querySelector<HTMLSelectElement>('#catalog-sort')!;
    select.value = 'price-asc';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const names = [...el.querySelectorAll('.card-name')].map((n) => n.textContent!.trim());
    expect(names).toEqual(['Laptop B', 'Laptop A', 'Laptop C']);
  });

  it('pide la página siguiente desde la paginación', async () => {
    window.scrollTo = vi.fn();
    await render();
    await flush(3);
    el.querySelector<HTMLButtonElement>('[aria-label="Página 2"]')!.click();
    fixture.detectChanges();
    TestBed.tick();
    const req = http.expectOne((r) => r.url.includes('/products'));
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ items: [], total: 0, page: 2, limit: 40, pages: 3 });
  });

  it('muestra el estado vacío si no hay productos', async () => {
    await render();
    http.expectOne((r) => r.url.includes('/products')).flush({ items: [], total: 0, page: 1, limit: 40, pages: 1 });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('.empty-state')).toBeTruthy();
  });
});
