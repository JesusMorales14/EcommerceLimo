import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { SearchService } from '@core/services/search.service';
import { ThemeService } from '@core/services/theme.service';
import { mockMatchMedia } from '../../../testing/browser-mocks';
import { Header } from './header';

const EMPTY_PAGE = { items: [], total: 0, page: 1, limit: 100, pages: 1 };

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let el: HTMLElement;
  let searchService: SearchService;
  let http: HttpTestingController;

  const typeAndSubmit = (formSelector: string, value: string) => {
    const form = el.querySelector<HTMLFormElement>(formSelector)!;
    const input = form.querySelector('input')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    mockMatchMedia();
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    el = fixture.nativeElement;
    searchService = TestBed.inject(SearchService);
    http = TestBed.inject(HttpTestingController);
    http.match(() => true);
    await fixture.whenStable();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    http.verify();
  });

  it('se crea correctamente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('búsqueda', () => {
    it('no abre el modal si la consulta está vacía', () => {
      typeAndSubmit('.search-bar', '   ');
      expect(searchService.isOpen()).toBe(false);
    });

    it('delega al SearchService con la consulta recortada y limpia el campo', () => {
      const openSpy = vi.spyOn(searchService, 'open');
      typeAndSubmit('.search-bar', '  LG  ');

      expect(openSpy).toHaveBeenCalledWith('LG');
      vi.advanceTimersByTime(300);
      http.expectOne((r) => r.url.includes('/products')).flush(EMPTY_PAGE);
      expect(fixture.componentInstance['searchQuery']()).toBe('');
    });

    it('el buscador móvil también abre el modal de resultados', () => {
      typeAndSubmit('.mobile-search-row', 'Samsung');
      vi.advanceTimersByTime(300);
      http.expectOne((r) => r.url.includes('/products')).flush(EMPTY_PAGE);
      expect(searchService.isOpen()).toBe(true);
      expect(el.querySelector('app-search-results-modal')).toBeTruthy();
    });
  });

  describe('menú móvil', () => {
    const menuButton = () => el.querySelector<HTMLButtonElement>('.mobile-menu-btn')!;

    it('abre el drawer y actualiza aria-expanded', () => {
      menuButton().click();
      fixture.detectChanges();
      expect(el.querySelector('app-mobile-menu')).toBeTruthy();
      expect(menuButton().getAttribute('aria-expanded')).toBe('true');
    });

    it('al cerrar aplica la animación y desmonta el drawer tras 300 ms', () => {
      menuButton().click();
      fixture.detectChanges();
      el.querySelector<HTMLButtonElement>('.drawer-close-btn')!.click();
      fixture.detectChanges();
      expect(el.querySelector('.category-drawer.closing')).toBeTruthy();

      vi.advanceTimersByTime(300);
      fixture.detectChanges();
      expect(el.querySelector('app-mobile-menu')).toBeNull();
    });
  });

  it('el botón de tema delega en ThemeService', () => {
    const spy = vi.spyOn(TestBed.inject(ThemeService), 'toggleWithTransition');
    el.querySelector<HTMLButtonElement>('.theme-toggle')!.click();
    expect(spy).toHaveBeenCalled();
  });
});
