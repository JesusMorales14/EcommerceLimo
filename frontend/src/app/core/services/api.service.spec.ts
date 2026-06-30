import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('hace GET a la URL correcta sin params', () => {
      let result: unknown;
      service.get<{ ok: boolean }>('/ping').subscribe(r => (result = r));

      const req = http.expectOne(`${base}/ping`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ ok: true });

      expect(result).toEqual({ ok: true });
    });

    it('hace GET con query params cuando se proveen', () => {
      service.get<unknown>('/search', { q: 'monitor', page: '2' }).subscribe();

      const req = http.expectOne(r => r.url === `${base}/search`);
      expect(req.request.params.get('q')).toBe('monitor');
      expect(req.request.params.get('page')).toBe('2');
      req.flush([]);
    });
  });

  describe('post', () => {
    it('hace POST con el body correcto', () => {
      const body = { name: 'Nuevo' };
      service.post<{ id: number }>('/items', body).subscribe();

      const req = http.expectOne(`${base}/items`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({ id: 1 });
    });
  });

  describe('patch', () => {
    it('hace PATCH con el body correcto', () => {
      const body = { name: 'Actualizado' };
      service.patch<{ id: number }>('/items/1', body).subscribe();

      const req = http.expectOne(`${base}/items/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(body);
      req.flush({ id: 1 });
    });
  });

  describe('delete', () => {
    it('hace DELETE a la URL correcta', () => {
      service.delete<void>('/items/1').subscribe();

      const req = http.expectOne(`${base}/items/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('manejo de errores', () => {
    it('propaga el error HTTP al subscriber', () => {
      let errorResult: unknown;
      service.get('/fail').subscribe({ error: (e) => (errorResult = e) });

      const req = http.expectOne(`${base}/fail`);
      req.flush('boom', { status: 500, statusText: 'Server Error' });

      expect(errorResult).toBeTruthy();
      expect((errorResult as { status: number }).status).toBe(500);
    });
  });
});
