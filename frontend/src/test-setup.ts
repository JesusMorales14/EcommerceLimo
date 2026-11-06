/**
 * Configuración global de las pruebas unitarias (Vitest + jsdom).
 * Implementa APIs del navegador que jsdom no provee.
 */
import { vi } from 'vitest';

class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverStub,
});

// Aísla cada prueba: el carro y la sesión se persisten en localStorage.
beforeEach(() => localStorage.clear());

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
