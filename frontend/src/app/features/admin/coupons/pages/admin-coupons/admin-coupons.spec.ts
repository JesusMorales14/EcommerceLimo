import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ConfirmService } from '@core/services/confirm.service';
import { environment } from '@env/environment';
import { AdminCouponsPage } from './admin-coupons';

const url = `${environment.apiUrl}/coupons`;
const coupon = (id: number, active = true) => ({
  id, code: `CUP${id}`, discount: 10, isPercent: true, minAmount: 0, maxUses: 100, usedCount: 1, active,
  expiresAt: null, createdAt: '',
});

describe('AdminCouponsPage', () => {
  let fixture: ComponentFixture<AdminCouponsPage>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const flush = async (items = [coupon(1), coupon(2, false)]) => {
    http.expectOne(url).flush(items);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminCouponsPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfirmService, useValue: { confirm: () => true } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminCouponsPage);
    el = fixture.nativeElement;
    fixture.detectChanges();
    TestBed.tick();
  });

  afterEach(() => http.verify());

  it('muestra el estado vacío', async () => {
    await flush([]);
    expect(el.querySelector('.empty-state')).toBeTruthy();
  });

  it('lista los cupones y alterna su estado', async () => {
    await flush();
    expect(el.querySelectorAll('.coupons-table tbody tr')).toHaveLength(2);
    el.querySelector<HTMLButtonElement>('.btn-toggle')!.click();
    http.expectOne(`${url}/1/toggle`).flush({ ...coupon(1), active: false });
    fixture.detectChanges();
    expect(el.querySelector('.status-dot')!.textContent).toContain('Inactivo');
  });

  it('crea un cupón en mayúsculas y recarga la lista', async () => {
    await flush();
    el.querySelector<HTMLButtonElement>('.btn-new')!.click();
    fixture.detectChanges();
    const code = el.querySelector<HTMLInputElement>('#coupon-code')!;
    code.value = ' verano20 ';
    code.dispatchEvent(new Event('input'));
    el.querySelector('form.coupon-form-card')!.dispatchEvent(new Event('submit'));

    const req = http.expectOne((r) => r.method === 'POST' && r.url === url);
    expect(req.request.body.code).toBe('VERANO20');
    req.flush(coupon(3));
    fixture.detectChanges();
    TestBed.tick();
    await flush();
    expect(el.querySelector('app-coupon-form')).toBeNull();
  });

  it('exige el código del cupón', async () => {
    await flush();
    el.querySelector<HTMLButtonElement>('.btn-new')!.click();
    fixture.detectChanges();
    el.querySelector('form.coupon-form-card')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(el.querySelector('.form-error')!.textContent).toContain('obligatorio');
  });

  it('elimina un cupón', async () => {
    await flush();
    el.querySelector<HTMLButtonElement>('.btn-delete')!.click();
    http.expectOne((r) => r.method === 'DELETE' && r.url === `${url}/1`).flush({});
    TestBed.tick();
    await flush([coupon(2)]);
    expect(el.querySelectorAll('.coupons-table tbody tr')).toHaveLength(1);
  });
});
