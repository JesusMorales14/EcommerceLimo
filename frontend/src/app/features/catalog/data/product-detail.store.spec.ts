import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { RecentlyViewedService } from '@core/services/recently-viewed.service';
import { environment } from '@env/environment';
import { ProductDetailStore } from './product-detail.store';

const base = environment.apiUrl;
const PRODUCT = {
  id: 1, name: 'Galaxy S24', price: 2800, description: 'Flagship', brand: 'Samsung',
  category: 'tecnologia', images: ['img1.jpg'], colors: ['#000', '#fff'], sizes: ['128GB', '256GB'],
  colorImages: { '#000': ['black.jpg'] }, isOffer: false, stock: 10,
};
const REVIEWS = [{ id: 1, rating: 5, comment: 'Excelente', user: { id: 2, name: 'Ana' }, createdAt: '' }];
const STATS = { average: 5, total: 1, distribution: { 5: 1 } };

describe('ProductDetailStore', () => {
  let store: ProductDetailStore;
  let http: HttpTestingController;

  const loadAll = () => {
    store.load(1);
    http.expectOne(`${base}/products/1`).flush(PRODUCT);
    http.expectOne(`${base}/reviews/product/1`).flush(REVIEWS);
    http.expectOne(`${base}/reviews/product/1/stats`).flush(STATS);
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ProductDetailStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ProductDetailStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga producto, reseñas y estadísticas', () => {
    const addSpy = vi.spyOn(TestBed.inject(RecentlyViewedService), 'add');
    loadAll();
    expect(store.loading()).toBe(false);
    expect(store.product()?.name).toBe('Galaxy S24');
    expect(store.reviews()).toHaveLength(1);
    expect(store.reviewCount()).toBe(1);
    expect(store.selectedSize()).toBe('128GB');
    expect(addSpy).toHaveBeenCalled();
  });

  it('deja de cargar si el producto no existe', () => {
    store.load(99);
    http.expectOne(`${base}/products/99`).flush({}, { status: 404, statusText: 'Not Found' });
    expect(store.loading()).toBe(false);
    expect(store.product()).toBeNull();
  });

  it('activeImages usa las imágenes del color seleccionado si existen', () => {
    loadAll();
    expect(store.activeImages()).toEqual(['black.jpg']);
    store.selectedColorIndex.set(1);
    expect(store.activeImages()).toEqual(['img1.jpg']);
  });

  it('distributionPercent calcula el porcentaje por estrella', () => {
    loadAll();
    expect(store.distributionPercent(5)).toBe(100);
    expect(store.distributionPercent(1)).toBe(0);
  });

  describe('submitReview', () => {
    it('exige un comentario', () => {
      loadAll();
      store.submitReview(5, '   ', vi.fn());
      expect(store.reviewError()).toBe('Escribe un comentario.');
    });

    it('publica la reseña y actualiza las estadísticas', () => {
      loadAll();
      const onSuccess = vi.fn();
      store.submitReview(3, 'Bueno', onSuccess);
      const req = http.expectOne(`${base}/reviews/product/1`);
      expect(req.request.body).toEqual({ rating: 3, comment: 'Bueno' });
      req.flush({ id: 2, rating: 3, comment: 'Bueno', user: { id: 1, name: 'Yo' }, createdAt: '' });

      expect(store.reviews()[0].id).toBe(2);
      expect(store.stats()).toEqual({ total: 2, average: 4, distribution: { 3: 1, 5: 1 } });
      expect(onSuccess).toHaveBeenCalled();
    });

    it('muestra el error del backend', () => {
      loadAll();
      store.submitReview(5, 'Otra', vi.fn());
      http
        .expectOne(`${base}/reviews/product/1`)
        .flush({ message: 'Ya dejaste una reseña' }, { status: 409, statusText: 'Conflict' });
      expect(store.reviewError()).toBe('Ya dejaste una reseña');
      expect(store.submittingReview()).toBe(false);
    });
  });
});
