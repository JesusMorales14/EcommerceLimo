import { TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { GlobalErrorHandler } from './global-error.handler';
import { LoggerService } from '../logger/logger.service';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let loggerMock: { error: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    loggerMock = { error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        GlobalErrorHandler,
        { provide: LoggerService, useValue: loggerMock },
      ],
    });

    handler = TestBed.inject(GlobalErrorHandler);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('debería crearse correctamente', () => {
    expect(handler).toBeTruthy();
  });

  it('registra un Error normal sin navegar', () => {
    const error = new Error('Algo falló');
    handler.handleError(error);

    expect(loggerMock.error).toHaveBeenCalledWith('Error no manejado', {
      message: 'Algo falló',
      stack: error.stack,
    });
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('convierte un valor no-Error en Error antes de registrarlo', () => {
    handler.handleError('mensaje plano');

    expect(loggerMock.error).toHaveBeenCalledWith(
      'Error no manejado',
      expect.objectContaining({ message: 'mensaje plano' })
    );
  });

  it('navega a / si el error es un ChunkLoadError', () => {
    const error = new Error('ChunkLoadError: failed to load chunk');
    const zone = TestBed.inject(NgZone);
    const runSpy = vi.spyOn(zone, 'run').mockImplementation((fn: any) => fn());

    handler.handleError(error);

    expect(runSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('navega a / si el mensaje incluye "Loading chunk"', () => {
    const error = new Error('Loading chunk 5 failed');
    vi.spyOn(TestBed.inject(NgZone), 'run').mockImplementation((fn: any) => fn());

    handler.handleError(error);

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
