import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '@env/environment';
import { Inicio } from './inicio';

const base = environment.apiUrl;
const FEATURED = { items: [{ id: 1, name: 'TV', brand: 'LG', price: 2000, stock: 1, images: [], colors: [], sizes: [] }], total: 6 };

describe('Inicio (home)', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Inicio],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('compone el hero, banners y la sección diferida de destacados', async () => {
    const fixture = TestBed.createComponent(Inicio);
    fixture.detectChanges();
    TestBed.tick();

    http.expectOne(`${base}/deal-sessions/active`).flush(null);
    http.expectOne(`${base}/deal-sessions/scheduled`).flush(null);
    http.expectOne((r) => r.urlWithParams.includes('isFeatured=true')).flush(FEATURED);
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('app-home-hero h1')).toBeTruthy();
    expect(el.querySelector('app-promo-banners')).toBeTruthy();
    expect(el.querySelector('app-deal-teaser')).toBeNull();

    const [featuredBlock] = await fixture.getDeferBlocks();
    await featuredBlock.render(DeferBlockState.Complete);
    fixture.detectChanges();
    expect(el.querySelectorAll('app-featured-section app-product-card')).toHaveLength(1);
    expect(el.querySelector('app-featured-section .link-ver-mas')).toBeTruthy();
  });
});
