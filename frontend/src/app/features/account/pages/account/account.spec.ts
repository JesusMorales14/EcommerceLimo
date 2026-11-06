import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { isOrderStepDone } from '@core/models/order.model';
import { environment } from '@env/environment';
import { AccountPage } from './account';

const base = environment.apiUrl;
const USER = { id: 1, name: 'Ana García', email: 'ana@test.com', role: 'USER', phone: '999' };
const order = (id: number, status = 'PENDING') => ({
  id, status, total: 100, createdAt: '2026-01-01T10:00:00Z', userId: 1,
  items: [{ id, quantity: 1, price: 100, product: { name: `P${id}` } }],
});

describe('AccountPage', () => {
  let fixture: ComponentFixture<AccountPage>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const render = async (orders: unknown[] | 'error') => {
    fixture = TestBed.createComponent(AccountPage);
    el = fixture.nativeElement;
    fixture.detectChanges();
    TestBed.tick();
    const req = http.expectOne(`${base}/orders/mine`);
    if (orders === 'error') req.flush({}, { status: 500, statusText: 'Error' });
    else req.flush(orders);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('gh_token', 'tok');
    localStorage.setItem('gh_user', JSON.stringify(USER));
    TestBed.configureTestingModule({
      imports: [AccountPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('muestra el perfil y el estado vacío de pedidos', async () => {
    await render([]);
    expect(el.querySelector('h1')!.textContent).toContain('Ana García');
    expect(el.querySelector('.empty-orders')).toBeTruthy();
  });

  it('pagina los pedidos de 3 en 3', async () => {
    await render([1, 2, 3, 4].map((id) => order(id)));
    expect(el.querySelectorAll('app-order-card')).toHaveLength(3);
    el.querySelector<HTMLButtonElement>('[aria-label="Página 2"]')!.click();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-order-card')).toHaveLength(1);
  });

  it('muestra la barra de cancelado en lugar del seguimiento', async () => {
    await render([order(1, 'CANCELLED')]);
    expect(el.querySelector('.order-cancelled-bar')).toBeTruthy();
    expect(el.querySelector('app-order-timeline')).toBeNull();
  });

  it('no rompe la vista si falla la carga', async () => {
    await render('error');
    expect(el.querySelector('.empty-orders')).toBeTruthy();
  });

  it('edita el perfil y cierra el formulario al guardar', async () => {
    await render([]);
    el.querySelector<HTMLButtonElement>('.btn-edit')!.click();
    fixture.detectChanges();
    const name = el.querySelector<HTMLInputElement>('input[formControlName="name"]')!;
    name.value = 'Ana María';
    name.dispatchEvent(new Event('input'));
    el.querySelector('form.edit-card')!.dispatchEvent(new Event('submit'));

    const req = http.expectOne(`${base}/auth/profile`);
    expect(req.request.body.name).toBe('Ana María');
    req.flush({ ...USER, name: 'Ana María' });
    fixture.detectChanges();
    expect(el.querySelector('app-profile-edit-form')).toBeNull();
    expect(el.querySelector('h1')!.textContent).toContain('Ana María');
  });

  it('isOrderStepDone compara la posición de los estados', () => {
    expect(isOrderStepDone('SHIPPING', 'PENDING')).toBe(true);
    expect(isOrderStepDone('SHIPPING', 'SHIPPING')).toBe(false);
    expect(isOrderStepDone('PENDING', 'DELIVERED')).toBe(false);
  });
});
