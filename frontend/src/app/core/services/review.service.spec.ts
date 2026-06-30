import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ReviewService, type Review, type ReviewStats } from './review.service';
import { environment } from '../../../environments/environment';

const mockReview: Review = {
  id: 1,
  rating: 5,
  comment: 'Excelente producto',
  createdAt: '2026-01-01T00:00:00.000Z',
  user: { id: 1, name: 'Juan Pérez' },
};

const mockStats: ReviewStats = {
  average: 4.5,
  total: 10,
  distribution: { 1: 0, 2: 0, 3: 1, 4: 4, 5: 5 },
};

describe('ReviewService', () => {
  let service: ReviewService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReviewService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('getByProduct', () => {
    it('hace GET /reviews/product/:id y retorna las reseñas', () => {
      let result: Review[] | undefined;
      service.getByProduct(1).subscribe(r => (result = r));

      const req = http.expectOne(`${base}/reviews/product/1`);
      expect(req.request.method).toBe('GET');
      req.flush([mockReview]);

      expect(result?.length).toBe(1);
      expect(result?.[0].rating).toBe(5);
    });

    it('maneja una lista vacía de reseñas', () => {
      let result: Review[] | undefined;
      service.getByProduct(1).subscribe(r => (result = r));

      http.expectOne(`${base}/reviews/product/1`).flush([]);

      expect(result).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('hace GET /reviews/product/:id/stats y retorna las estadísticas', () => {
      let result: ReviewStats | undefined;
      service.getStats(1).subscribe(r => (result = r));

      const req = http.expectOne(`${base}/reviews/product/1/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);

      expect(result).toEqual(mockStats);
    });
  });

  describe('create', () => {
    it('hace POST /reviews/product/:id con rating y comment', () => {
      service.create(1, 5, 'Muy bueno').subscribe();

      const req = http.expectOne(`${base}/reviews/product/1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ rating: 5, comment: 'Muy bueno' });
      req.flush(mockReview);
    });

    it('propaga error si la reseña es inválida', () => {
      let errorResult: unknown;
      service.create(1, 0, '').subscribe({ error: (e) => (errorResult = e) });

      http.expectOne(`${base}/reviews/product/1`).flush(
        { message: 'Rating inválido' },
        { status: 422, statusText: 'Unprocessable Entity' }
      );

      expect((errorResult as { status: number }).status).toBe(422);
    });
  });

  describe('delete', () => {
    it('hace DELETE /reviews/:id', () => {
      service.delete(1).subscribe();

      const req = http.expectOne(`${base}/reviews/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
