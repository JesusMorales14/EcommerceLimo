import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ThemeService } from './theme.service';

// El ThemeService accede a localStorage y window.matchMedia en el constructor.
// Como este worker Node no expone localStorage como global, lo mockeamos
// antes de crear el servicio, igual que hacen los specs preexistentes del repo
// que usan store en memoria en vez de globalThis.localStorage.

function buildLocalStorageMock(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    _store: store,
  };
}

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
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

function setupThemeService(
  lsInitial: Record<string, string> = {},
  prefersDark = false
) {
  const lsMock = buildLocalStorageMock(lsInitial);
  Object.defineProperty(window, 'localStorage', {
    writable: true,
    configurable: true,
    value: lsMock,
  });
  mockMatchMedia(prefersDark);
  TestBed.configureTestingModule({});
  return { service: TestBed.inject(ThemeService), lsMock };
}

describe('ThemeService', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('debería crearse correctamente', () => {
    const { service } = setupThemeService();
    expect(service).toBeTruthy();
  });

  describe('estado inicial', () => {
    it('usa el tema "dark" guardado en localStorage', () => {
      const { service } = setupThemeService({ theme: 'dark' }, false);
      expect(service.isDark()).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('usa el tema "light" guardado en localStorage ignorando preferencia del sistema', () => {
      const { service } = setupThemeService({ theme: 'light' }, true);
      expect(service.isDark()).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('sin tema guardado, aplica preferencia del sistema oscuro', () => {
      const { service } = setupThemeService({}, true);
      expect(service.isDark()).toBe(true);
    });

    it('sin tema guardado y sin preferencia de sistema, usa modo claro', () => {
      const { service } = setupThemeService({}, false);
      expect(service.isDark()).toBe(false);
    });
  });

  describe('toggle', () => {
    it('alterna de claro a oscuro y persiste en localStorage', () => {
      const { service, lsMock } = setupThemeService({ theme: 'light' }, false);

      expect(service.isDark()).toBe(false);
      service.toggle();

      expect(service.isDark()).toBe(true);
      expect(lsMock.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('alterna de oscuro a claro y persiste en localStorage', () => {
      const { service, lsMock } = setupThemeService({ theme: 'dark' }, false);

      expect(service.isDark()).toBe(true);
      service.toggle();

      expect(service.isDark()).toBe(false);
      expect(lsMock.setItem).toHaveBeenLastCalledWith('theme', 'light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('toggle dos veces restaura el tema original', () => {
      const { service } = setupThemeService({}, false);
      const initial = service.isDark();
      service.toggle();
      service.toggle();
      expect(service.isDark()).toBe(initial);
    });
  });
});
