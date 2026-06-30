import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DealSessionService, type DealSession } from './deal-session.service';
import { environment } from '../../../environments/environment';

const mockSession: DealSession = {
  id: 1,
  startsAt: '2026-01-01T00:00:00.000Z',
  endsAt: '2026-01-02T00:00:00.000Z',
  active: true,
  createdAt: '2025-12-31T00:00:00.000Z',
};

describe('DealSessionService', () => {
  let service: DealSessionService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DealSessionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('getActive', () => {
    it('hace GET /deal-sessions/active y retorna la sesión', () => {
      let result: DealSession | null | undefined;
      service.getActive().subscribe(r => (result = r));

      const req = http.expectOne(`${base}/deal-sessions/active`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);

      expect(result).toEqual(mockSession);
    });

    it('retorna null si no hay sesión activa', () => {
      let result: DealSession | null | undefined;
      service.getActive().subscribe(r => (result = r));

      http.expectOne(`${base}/deal-sessions/active`).flush(null);

      expect(result).toBeNull();
    });
  });

  describe('getScheduled', () => {
    it('hace GET /deal-sessions/scheduled y retorna la sesión programada', () => {
      let result: DealSession | null | undefined;
      service.getScheduled().subscribe(r => (result = r));

      const req = http.expectOne(`${base}/deal-sessions/scheduled`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);

      expect(result).toEqual(mockSession);
    });

    it('retorna null si no hay sesión programada', () => {
      let result: DealSession | null | undefined;
      service.getScheduled().subscribe(r => (result = r));

      http.expectOne(`${base}/deal-sessions/scheduled`).flush(null);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('hace POST /deal-sessions solo con endsAt cuando no se pasa startsAt', () => {
      const endsAt = new Date('2026-02-01T00:00:00.000Z');
      service.create(endsAt).subscribe();

      const req = http.expectOne(`${base}/deal-sessions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ endsAt: endsAt.toISOString() });
      req.flush(mockSession);
    });

    it('hace POST /deal-sessions con endsAt y startsAt cuando ambos se proveen', () => {
      const endsAt = new Date('2026-02-01T00:00:00.000Z');
      const startsAt = new Date('2026-01-15T00:00:00.000Z');
      service.create(endsAt, startsAt).subscribe();

      const req = http.expectOne(`${base}/deal-sessions`);
      expect(req.request.body).toEqual({
        endsAt: endsAt.toISOString(),
        startsAt: startsAt.toISOString(),
      });
      req.flush(mockSession);
    });
  });

  describe('cancel', () => {
    it('hace DELETE /deal-sessions/active', () => {
      let result: { ok: boolean } | undefined;
      service.cancel().subscribe(r => (result = r));

      const req = http.expectOne(`${base}/deal-sessions/active`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ ok: true });

      expect(result).toEqual({ ok: true });
    });
  });
});
