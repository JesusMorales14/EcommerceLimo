import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggerService);
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('warn', () => {
    it('escribe en console.warn con prefijo [WARN]', () => {
      service.warn('algo pasó', { foo: 'bar' });
      expect(warnSpy).toHaveBeenCalledWith('[WARN] algo pasó', { foo: 'bar' });
    });

    it('usa string vacío como contexto por defecto', () => {
      service.warn('sin contexto');
      expect(warnSpy).toHaveBeenCalledWith('[WARN] sin contexto', '');
    });
  });

  describe('error', () => {
    it('escribe en console.error con prefijo [ERROR]', () => {
      const ctx = { status: 500 };
      service.error('algo falló', ctx);
      expect(errorSpy).toHaveBeenCalledWith('[ERROR] algo falló', ctx);
    });

    it('usa string vacío como contexto por defecto', () => {
      service.error('sin contexto');
      expect(errorSpy).toHaveBeenCalledWith('[ERROR] sin contexto', '');
    });
  });

  describe('debug', () => {
    it('en modo dev escribe en console.warn con prefijo [DEBUG]', () => {
      // isDevMode() es true en el entorno de test (no se hizo bootstrap de prod)
      service.debug('detalle', { a: 1 });
      expect(warnSpy).toHaveBeenCalledWith('[DEBUG] detalle', { a: 1 });
    });
  });

  describe('info', () => {
    it('en modo dev escribe en console.warn con prefijo [INFO]', () => {
      service.info('info útil', { b: 2 });
      expect(warnSpy).toHaveBeenCalledWith('[INFO] info útil', { b: 2 });
    });
  });

  describe('log', () => {
    it('delega a warn cuando level es "warn"', () => {
      service.log('warn', 'delegado', { x: 1 });
      expect(warnSpy).toHaveBeenCalledWith('[WARN] delegado', { x: 1 });
    });

    it('delega a error cuando level es "error"', () => {
      service.log('error', 'delegado error', { y: 2 });
      expect(errorSpy).toHaveBeenCalledWith('[ERROR] delegado error', { y: 2 });
    });

    it('delega a info cuando level es "info"', () => {
      service.log('info', 'delegado info');
      expect(warnSpy).toHaveBeenCalledWith('[INFO] delegado info', '');
    });

    it('delega a debug cuando level es "debug"', () => {
      service.log('debug', 'delegado debug');
      expect(warnSpy).toHaveBeenCalledWith('[DEBUG] delegado debug', '');
    });
  });
});
