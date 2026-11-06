import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Product } from '@core/models/product.model';
import { CartService } from '@core/services/cart.service';
import { RecentlyViewedService } from '@core/services/recently-viewed.service';
import { RecentlyViewed } from './recently-viewed';

const PRODUCT: Product = {
  id: 1, name: 'Camiseta', description: 'desc', price: 50, discount: 10, stock: 5, brand: 'Marca',
  category: 'Ropa', isOffer: true, images: ['img.jpg'], colors: [], sizes: [],
};

describe('RecentlyViewed', () => {
  let history: RecentlyViewedService;

  const render = () => {
    const fixture = TestBed.createComponent(RecentlyViewed);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [RecentlyViewed], providers: [provideRouter([])] });
    history = TestBed.inject(RecentlyViewedService);
    history.clear();
  });

  it('no renderiza nada si no hay historial', () => {
    expect(render().el.querySelector('.rv-section')).toBeNull();
  });

  it('muestra los productos con su precio final', () => {
    history.add(PRODUCT);
    const { el } = render();
    expect(el.querySelectorAll('.rv-card')).toHaveLength(1);
    expect(el.querySelector('.rv-price')!.textContent).toContain('45');
    expect(el.querySelector('.rv-link')!.getAttribute('href')).toBe('/product/1');
  });

  it('agrega al carro sin navegar', () => {
    history.add(PRODUCT);
    const { el } = render();
    el.querySelector<HTMLButtonElement>('.rv-add-btn')!.click();
    expect(TestBed.inject(CartService).count()).toBe(1);
  });

  it('limpia el historial', () => {
    history.add(PRODUCT);
    const { fixture, el } = render();
    el.querySelector<HTMLButtonElement>('.rv-clear')!.click();
    fixture.detectChanges();
    expect(el.querySelector('.rv-section')).toBeNull();
  });
});
