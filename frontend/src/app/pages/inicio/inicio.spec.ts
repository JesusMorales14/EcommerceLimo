import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Inicio } from './inicio';
import { environment } from '../../../environments/environment';

const base = environment.apiUrl;

const mockFeatured = { items: [{ id: 1, name: 'TV Samsung', price: 2000, images: [], colors: [], sizes: [] }], total: 1 };
const mockOffers   = { items: [{ id: 2, name: 'Laptop Oferta', price: 1500, images: [], colors: [], sizes: [] }], total: 1 };
const mockSession  = { id: 1, endsAt: new Date(Date.now() + 3_600_000).toISOString(), startsAt: new Date().toISOString() };

describe('Inicio (home)', () => {
  let component: Inicio;
  let fixture:   ComponentFixture<Inicio>;
  let http:      HttpTestingController;

  const flushInit = (activeSession: any = null, scheduled: any = null) => {
    http.expectOne(r => r.urlWithParams.includes('/products') && r.urlWithParams.includes('isFeatured=true')).flush(mockFeatured);
    http.expectOne(`${base}/deal-sessions/active`).flush(activeSession);
    if (!activeSession) {
      http.expectOne(`${base}/deal-sessions/scheduled`).flush(scheduled);
    } else {
      http.expectOne(r => r.urlWithParams.includes('/products') && r.urlWithParams.includes('isOffer=true')).flush(mockOffers);
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:   [Inicio],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture   = TestBed.createComponent(Inicio);
    component = fixture.componentInstance;
    http      = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('debería crearse correctamente', () => {
    flushInit();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('carga los productos destacados', () => {
      flushInit();
      expect(component.featuredProducts()).toHaveLength(1);
      expect(component.featuredProducts()[0].name).toBe('TV Samsung');
      expect(component.featuredTotal()).toBe(1);
    });

    it('activa la sesión de oferta cuando hay una activa', () => {
      flushInit(mockSession);
      expect(component.dealActive()).toBe(true);
      expect(component.offerProducts()).toHaveLength(1);
    });

    it('no activa dealActive cuando no hay sesión activa', () => {
      flushInit(null, null);
      expect(component.dealActive()).toBe(false);
    });

    it('guarda la sesión programada cuando existe', () => {
      const scheduled = { startsAt: new Date(Date.now() + 7200_000).toISOString(), endsAt: new Date(Date.now() + 10800_000).toISOString() };
      flushInit(null, scheduled);
      expect(component.scheduledSession()).toEqual(scheduled);
    });
  });

  describe('ngOnDestroy', () => {
    it('limpia los timers sin lanzar error', () => {
      flushInit();
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
