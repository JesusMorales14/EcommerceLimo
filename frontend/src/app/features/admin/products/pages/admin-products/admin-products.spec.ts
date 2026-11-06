import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ConfirmService } from '@core/services/confirm.service';
import { environment } from '@env/environment';
import { AdminProductsPage } from './admin-products';

const base = environment.apiUrl;
const make = (id: number, category: string, name = `Producto ${id}`) => ({
  id, name, brand: 'Marca', category, price: 10 * id, stock: id, isOffer: false, images: [], colors: [], sizes: [],
});
const PRODUCTS = [
  ...Array.from({ length: 7 }, (_, i) => make(i + 1, 'tecnologia')),
  make(8, 'hogar', 'Lámpara'),
];

describe('AdminProductsPage', () => {
  let fixture: ComponentFixture<AdminProductsPage>;
  let el: HTMLElement;
  let http: HttpTestingController;
  let confirmResult = true;

  const flushProducts = async () => {
    http.expectOne((r) => r.url === `${base}/products`).flush({ items: PRODUCTS, total: PRODUCTS.length, page: 1, limit: 500, pages: 1 });
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const rows = () => el.querySelectorAll('.products-table tbody tr');

  beforeEach(async () => {
    confirmResult = true;
    TestBed.configureTestingModule({
      imports: [AdminProductsPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfirmService, useValue: { confirm: () => confirmResult } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminProductsPage);
    el = fixture.nativeElement;
    fixture.detectChanges();
    TestBed.tick();
    await flushProducts();
  });

  afterEach(() => http.verify());

  it('pagina el listado de 6 en 6', () => {
    expect(rows()).toHaveLength(6);
    el.querySelector<HTMLButtonElement>('[aria-label="Página 2"]')!.click();
    fixture.detectChanges();
    expect(rows()).toHaveLength(2);
  });

  it('filtra por categoría y por texto', () => {
    fixture.componentInstance.selectedCategory.set('hogar');
    fixture.detectChanges();
    expect(rows()).toHaveLength(1);

    fixture.componentInstance.selectedCategory.set('');
    fixture.componentInstance.search.set('lámp');
    fixture.detectChanges();
    expect(fixture.componentInstance.filteredProducts().map((p) => p.id)).toEqual([8]);
  });

  it('abre el formulario de creación y crea el producto', async () => {
    el.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    fixture.detectChanges();
    expect(el.querySelector('#product-form-title')!.textContent).toContain('Nuevo producto');

    const setValue = (selector: string, value: string) => {
      const input = el.querySelector<HTMLInputElement>(selector)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    setValue('#product-name', 'Mesa');
    setValue('#product-category', 'hogar');
    setValue('#product-images', 'm.jpg');
    el.querySelector('.product-form-panel form')!.dispatchEvent(new Event('submit'));

    const req = http.expectOne((r) => r.method === 'POST' && r.url === `${base}/products`);
    expect(req.request.body).toMatchObject({ name: 'Mesa', category: 'hogar', images: ['m.jpg'] });
    req.flush({ id: 99 });
    fixture.detectChanges();
    TestBed.tick();
    await flushProducts();
    expect(el.querySelector('app-product-form-panel')).toBeNull();
  });

  it('valida los campos obligatorios del formulario', () => {
    el.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    fixture.detectChanges();
    el.querySelector('.product-form-panel form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(el.querySelector('.form-error')!.textContent).toContain('obligatorios');
    http.expectNone((r) => r.method === 'POST');
  });

  it('elimina un producto tras confirmar y no lo hace si se cancela', async () => {
    confirmResult = false;
    el.querySelector<HTMLButtonElement>('.products-table .btn-del')!.click();
    http.expectNone((r) => r.method === 'DELETE');

    confirmResult = true;
    el.querySelector<HTMLButtonElement>('.products-table .btn-del')!.click();
    http.expectOne((r) => r.method === 'DELETE' && r.url === `${base}/products/1`).flush({});
    TestBed.tick();
    await flushProducts();
  });
});
