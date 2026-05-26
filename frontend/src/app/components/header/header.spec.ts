import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { Header } from './header';
import { SearchService } from '../../core/services/search.service';

const matchMediaMock = (query: string) => ({
  matches: false, media: query, onchange: null,
  addListener: vi.fn(), removeListener: vi.fn(),
  addEventListener: vi.fn(), removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let searchService: SearchService;
  let http: HttpTestingController;

  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn().mockImplementation(matchMediaMock) });

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture       = TestBed.createComponent(Header);
    component     = fixture.componentInstance;
    searchService = TestBed.inject(SearchService);
    http          = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // ── UI state ─────────────────────────────────────────────────────────────────

  describe('menú de cuenta', () => {
    it('toggleAccountMenu alterna el estado', () => {
      expect(component.showAccountMenu()).toBe(false);
      component.toggleAccountMenu();
      expect(component.showAccountMenu()).toBe(true);
      component.toggleAccountMenu();
      expect(component.showAccountMenu()).toBe(false);
    });

    it('closeAccountMenu cierra el menú', () => {
      component.toggleAccountMenu();
      component.closeAccountMenu();
      expect(component.showAccountMenu()).toBe(false);
    });
  });

  describe('búsqueda móvil', () => {
    it('openMobileSearch abre el overlay', () => {
      component.openMobileSearch();
      expect(component.mobileSearchOpen()).toBe(true);
    });

    it('closeMobileSearch cierra y limpia la query', () => {
      component.searchQuery = 'televisor';
      component.openMobileSearch();
      component.closeMobileSearch();
      expect(component.mobileSearchOpen()).toBe(false);
      expect(component.searchQuery).toBe('');
    });
  });

  describe('menú móvil', () => {
    it('openMobileMenu / closeMobileMenu alterna el drawer', () => {
      component.openMobileMenu();
      expect(component.mobileMenuOpen()).toBe(true);
      component.closeMobileMenu();
      expect(component.mobileMenuOpen()).toBe(false);
    });
  });

  // ── search ───────────────────────────────────────────────────────────────────

  describe('search()', () => {
    it('no abre el modal si la query está vacía', () => {
      component.searchQuery = '   ';
      component.search();
      expect(searchService.isOpen()).toBe(false);
    });

    it('delega al SearchService con la query recortada', () => {
      const openSpy = vi.spyOn(searchService, 'open');
      component.searchQuery = '  LG  ';
      component.search();
      expect(openSpy).toHaveBeenCalledWith('LG');
    });

    it('limpia la query y cierra el overlay móvil tras buscar', () => {
      component.mobileSearchOpen.set(true);
      component.searchQuery = 'Samsung';
      component.search();

      // flush the HTTP request triggered by SearchService.open()
      http.expectOne(r => r.url.includes('/products')).flush({ items: [], total: 0, page: 1, limit: 100, pages: 1 });

      expect(component.searchQuery).toBe('');
      expect(component.mobileSearchOpen()).toBe(false);
    });
  });
});
