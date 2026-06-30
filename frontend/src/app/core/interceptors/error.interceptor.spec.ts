import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { throwError, firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../logger/logger.service';

describe('errorInterceptor', () => {
  let authMock: { logout: ReturnType<typeof vi.fn> };
  let loggerMock: {
    error: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    debug: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(() => {
    authMock = { logout: vi.fn() };
    loggerMock = { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        { provide: LoggerService, useValue: loggerMock },
      ],
    });
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  function run(status: number, errorBody: any = {}) {
    const req = new HttpRequest('GET', '/api/test');
    const httpError = new HttpErrorResponse({ status, error: errorBody, url: '/api/test' });
    const next: HttpHandlerFn = vi.fn(() => throwError(() => httpError));

    return TestBed.runInInjectionContext(() =>
      firstValueFrom(errorInterceptor(req, next)).catch((e) => e)
    );
  }

  it('reenvía el error sin modificarlo', async () => {
    const result = await run(404);
    expect(result).toBeInstanceOf(HttpErrorResponse);
    expect((result as HttpErrorResponse).status).toBe(404);
  });

  it('status 0: registra error de conexión', async () => {
    await run(0);
    expect(loggerMock.error).toHaveBeenCalledWith('Sin conexión al servidor', expect.anything());
  });

  it('status 401: hace logout y navega a /login', async () => {
    await run(401);
    expect(loggerMock.warn).toHaveBeenCalledWith('Sesión expirada', expect.objectContaining({ url: '/api/test' }));
    expect(authMock.logout).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('status 403: navega a / sin hacer logout', async () => {
    await run(403);
    expect(loggerMock.warn).toHaveBeenCalledWith('Acceso denegado', expect.objectContaining({ url: '/api/test' }));
    expect(authMock.logout).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('status 404: solo registra warning', async () => {
    await run(404);
    expect(loggerMock.warn).toHaveBeenCalledWith('Recurso no encontrado', expect.objectContaining({ url: '/api/test' }));
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('status 422: registra warning con mensaje', async () => {
    await run(422, { message: 'Datos inválidos' });
    expect(loggerMock.warn).toHaveBeenCalledWith(
      'Datos inválidos',
      expect.objectContaining({ url: '/api/test', message: 'Datos inválidos' })
    );
  });

  it('status >= 500: registra error de servidor', async () => {
    await run(500, { message: 'boom' });
    expect(loggerMock.error).toHaveBeenCalledWith(
      'Error del servidor',
      expect.objectContaining({ status: 500, url: '/api/test', message: 'boom' })
    );
  });

  it('status sin manejo específico (ej. 418) no registra nada adicional', async () => {
    await run(418);
    expect(loggerMock.error).not.toHaveBeenCalled();
    expect(loggerMock.warn).not.toHaveBeenCalled();
  });

  it('usa mensaje por defecto si no hay error.message ni error.error.message', async () => {
    await run(500, null);
    expect(loggerMock.error).toHaveBeenCalledWith(
      'Error del servidor',
      expect.objectContaining({ message: expect.any(String) })
    );
  });
});
