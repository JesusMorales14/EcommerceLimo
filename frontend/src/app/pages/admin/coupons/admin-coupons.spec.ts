import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminCouponsPage } from './admin-coupons';
import { environment } from '../../../../environments/environment';

const mockCoupon = {
  id: 1, code: 'PROMO10', discount: 10, isPercent: true,
  minAmount: 0, maxUses: 100, usedCount: 5, active: true,
  expiresAt: null, createdAt: '2024-01-01T00:00:00Z',
};

describe('AdminCouponsPage', () => {
  let component: AdminCouponsPage;
  let fixture: ComponentFixture<AdminCouponsPage>;
  let http: HttpTestingController;

  const flushCoupons = (coupons = [mockCoupon]) =>
    http.expectOne(`${environment.apiUrl}/coupons`).flush(coupons);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCouponsPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCouponsPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('debería crearse correctamente', () => {
    flushCoupons([]);
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('carga los cupones y desactiva loading', () => {
      flushCoupons([mockCoupon]);
      expect(component.coupons()).toEqual([mockCoupon]);
      expect(component.loading()).toBe(false);
    });

    it('desactiva loading aunque haya error', () => {
      http.expectOne(`${environment.apiUrl}/coupons`)
        .error(new ErrorEvent('Network error'));
      expect(component.loading()).toBe(false);
    });
  });

  describe('openForm / closeForm', () => {
    beforeEach(() => flushCoupons([]));

    it('abre el formulario de creación', () => {
      component.openForm();
      expect(component.showForm()).toBe(true);
    });

    it('cierra el formulario', () => {
      component.openForm();
      component.closeForm();
      expect(component.showForm()).toBe(false);
    });
  });

  describe('save', () => {
    beforeEach(() => flushCoupons([]));

    it('muestra error si el código está vacío', () => {
      component.openForm();
      component.form.code = '';
      component.save();
      expect(component.error()).toContain('obligatorio');
      http.expectNone(`${environment.apiUrl}/coupons`);
    });

    it('crea el cupón correctamente', () => {
      component.openForm();
      component.form.code = 'VERANO20';
      component.save();

      const req = http.expectOne(`${environment.apiUrl}/coupons`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.code).toBe('VERANO20');
      req.flush(mockCoupon);

      flushCoupons([mockCoupon]);
      expect(component.showForm()).toBe(false);
      expect(component.saving()).toBe(false);
    });

    it('muestra error si la creación falla', () => {
      component.openForm();
      component.form.code = 'FAIL';
      component.save();

      http.expectOne(`${environment.apiUrl}/coupons`)
        .flush({ message: 'El código ya existe.' }, { status: 400, statusText: 'Bad Request' });
      expect(component.error()).toBe('El código ya existe.');
      expect(component.saving()).toBe(false);
    });
  });

  describe('toggle', () => {
    beforeEach(() => flushCoupons([mockCoupon]));

    it('alterna el estado activo del cupón', () => {
      component.toggle(mockCoupon as any);
      const req = http.expectOne(`${environment.apiUrl}/coupons/1/toggle`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ ...mockCoupon, active: false });
      expect(component.coupons()[0].active).toBe(false);
    });
  });
});
