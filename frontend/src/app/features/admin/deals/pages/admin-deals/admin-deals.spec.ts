import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ConfirmService } from '@core/services/confirm.service';
import { environment } from '@env/environment';
import { validateDealRange } from '../../components/deal-session-form/deal-session-form';
import { AdminDealsPage } from './admin-deals';

const base = environment.apiUrl;
const inHours = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();
const OFFERS = { items: [{ id: 1, name: 'TV', price: 999, images: [], discount: 10 }], total: 1 };

describe('AdminDealsPage', () => {
  let fixture: ComponentFixture<AdminDealsPage>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const flushInitial = async (active: object | null = null, scheduled: object | null = null) => {
    http.expectOne(`${base}/deal-sessions/active`).flush(active);
    http.expectOne(`${base}/deal-sessions/scheduled`).flush(scheduled);
    http.expectOne((r) => r.urlWithParams.includes('isOffer=true')).flush(OFFERS);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminDealsPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfirmService, useValue: { confirm: () => true } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminDealsPage);
    el = fixture.nativeElement;
    fixture.detectChanges();
    TestBed.tick();
  });

  afterEach(() => http.verify());

  it('muestra "sin oferta activa" y los productos en oferta', async () => {
    await flushInitial();
    expect(el.querySelector('.status-card.inactive')).toBeTruthy();
    expect(el.querySelectorAll('.offer-chip')).toHaveLength(1);
  });

  it('muestra la sesión activa y permite cancelarla', async () => {
    await flushInitial({ id: 1, startsAt: inHours(-1), endsAt: inHours(2) });
    expect(el.querySelector('.status-card.active .countdown')!.textContent).toMatch(/\d{2}:\d{2}:\d{2}/);

    el.querySelector<HTMLButtonElement>('.btn-cancel')!.click();
    http.expectOne((r) => r.method === 'DELETE').flush({ ok: true });
    fixture.detectChanges();
    expect(el.querySelector('.status-card.inactive')).toBeTruthy();
  });

  it('valida la fecha de fin antes de activar', async () => {
    await flushInitial();
    el.querySelector<HTMLButtonElement>('.btn-activate')!.click();
    fixture.detectChanges();
    expect(el.querySelector('.alert-error')!.textContent).toContain('fecha y hora de fin');
  });

  it('validateDealRange cubre los casos de error', async () => {
    await flushInitial();
    expect(validateDealRange(null)).toContain('fin');
    expect(validateDealRange(new Date(Date.now() - 1000))).toContain('futura');
    const end = new Date(Date.now() + 3_600_000);
    expect(validateDealRange(end, new Date(end.getTime() + 1))).toContain('anterior');
    expect(validateDealRange(end)).toBeNull();
  });
});
