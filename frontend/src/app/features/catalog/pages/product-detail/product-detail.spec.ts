import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { CartService } from '@core/services/cart.service';
import { environment } from '@env/environment';
import { ProductDetailComponent } from './product-detail';

const base = environment.apiUrl;
const PRODUCT = {
  id: 1, name: 'Galaxy S24', price: 2800, description: 'Smartphone flagship', brand: 'Samsung',
  category: 'tecnologia', images: ['img1.jpg', 'img2.jpg'], colors: [], sizes: [], isOffer: false, stock: 3,
};

describe('ProductDetailComponent', () => {
  let fixture: ComponentFixture<ProductDetailComponent>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const render = (product: object | null = PRODUCT) => {
    fixture = TestBed.createComponent(ProductDetailComponent);
    fixture.componentRef.setInput('id', '1');
    el = fixture.nativeElement;
    fixture.detectChanges();
    const req = http.expectOne(`${base}/products/1`);
    if (product) {
      req.flush(product);
      http.expectOne(`${base}/reviews/product/1`).flush([]);
      http.expectOne(`${base}/reviews/product/1/stats`).flush({ average: 0, total: 0, distribution: {} });
    } else {
      req.flush({}, { status: 404, statusText: 'Not Found' });
    }
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('muestra el producto con galería, panel de compra y pestañas', () => {
    render();
    expect(el.querySelector('h1')!.textContent).toContain('Galaxy S24');
    expect(el.querySelectorAll('.gallery-thumbs .thumb')).toHaveLength(2);
    expect(el.querySelectorAll('[role="tab"]')).toHaveLength(3);
  });

  it('actualiza el título y los datos estructurados para SEO', () => {
    render();
    expect(TestBed.inject(Title).getTitle()).toContain('Galaxy S24');
    expect(TestBed.inject(Meta).getTag('name="description"')?.content).toBe('Smartphone flagship');
    const jsonLd = document.getElementById('app-json-ld');
    expect(JSON.parse(jsonLd!.textContent!)['@type']).toBe('Product');
  });

  it('agrega al carro la cantidad elegida', () => {
    render();
    el.querySelector<HTMLButtonElement>('[aria-label="Aumentar cantidad"]')!.click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.btn-buy')!.click();
    expect(TestBed.inject(CartService).count()).toBe(2);
  });

  it('no permite superar el stock disponible', () => {
    render();
    const plus = el.querySelector<HTMLButtonElement>('[aria-label="Aumentar cantidad"]')!;
    for (let i = 0; i < 5; i++) {
      plus.click();
      fixture.detectChanges();
    }
    expect(plus.disabled).toBe(true);
    expect(el.querySelector('.qty-selector span')!.textContent).toContain('3');
  });

  it('muestra "no encontrado" si el producto no existe', () => {
    render(null);
    expect(el.querySelector('.not-found')).toBeTruthy();
  });

  it('las pestañas cambian el panel visible', () => {
    render();
    el.querySelector<HTMLButtonElement>('#tab-specs')!.click();
    fixture.detectChanges();
    expect(el.querySelector('app-product-specs')).toBeTruthy();
    expect(el.querySelector('#tab-specs')!.getAttribute('aria-selected')).toBe('true');
  });
});
