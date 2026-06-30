import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse, HttpHandlerFn } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  function setup(token: string | null) {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { getToken: () => token } },
      ],
    });
  }

  it('agrega el header Authorization si hay token', () => {
    setup('mock-jwt-token');
    const next: HttpHandlerFn = vi.fn((req) => of(new HttpResponse({ status: 200, url: req.url })));
    const req = new HttpRequest('GET', '/api/test');

    TestBed.runInInjectionContext(() => authInterceptor(req, next));

    expect(next).toHaveBeenCalledTimes(1);
    const sentReq = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpRequest<unknown>;
    expect(sentReq.headers.get('Authorization')).toBe('Bearer mock-jwt-token');
  });

  it('no agrega el header Authorization si no hay token', () => {
    setup(null);
    const next: HttpHandlerFn = vi.fn((req) => of(new HttpResponse({ status: 200, url: req.url })));
    const req = new HttpRequest('GET', '/api/test');

    TestBed.runInInjectionContext(() => authInterceptor(req, next));

    expect(next).toHaveBeenCalledTimes(1);
    const sentReq = (next as ReturnType<typeof vi.fn>).mock.calls[0][0] as HttpRequest<unknown>;
    expect(sentReq.headers.has('Authorization')).toBe(false);
    expect(sentReq).toBe(req);
  });
});
