import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '@env/environment';
import { AdminReclamacionesPage } from './admin-reclamaciones';

const url = `${environment.apiUrl}/reclamaciones`;
const claim = (id: number, estado: string) => ({
  id, estado, tipo: 'QUEJA', bien: 'SERVICIO', nombre: 'Ana', apellidos: 'Pérez', email: 'a@a.com', dni: '12345678',
  telefono: '999', detalle: 'Mala atención', respuesta: null, createdAt: '2026-01-01T00:00:00Z',
});

describe('AdminReclamacionesPage', () => {
  let fixture: ComponentFixture<AdminReclamacionesPage>;
  let el: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AdminReclamacionesPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminReclamacionesPage);
    el = fixture.nativeElement;
    fixture.detectChanges();
    TestBed.tick();
    http.expectOne(`${url}/all`).flush([claim(1, 'PENDIENTE'), claim(2, 'RESUELTO'), claim(3, 'PENDIENTE')]);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('calcula los contadores por estado', () => {
    expect(fixture.componentInstance.counts()).toEqual({ TODOS: 3, PENDIENTE: 2, EN_REVISION: 0, RESUELTO: 1, CERRADO: 0 });
    expect(el.querySelectorAll('.stat-card')).toHaveLength(4);
  });

  it('filtra por estado desde las pestañas', () => {
    const tabs = el.querySelectorAll<HTMLButtonElement>('.filter-tab');
    tabs[1].click();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-admin-claim-card')).toHaveLength(2);
    expect(tabs[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('expande una reclamación y guarda la respuesta', async () => {
    el.querySelector<HTMLButtonElement>('.rec-row')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const textarea = el.querySelector<HTMLTextAreaElement>('#respuesta-1')!;
    textarea.value = 'Lo sentimos';
    textarea.dispatchEvent(new Event('input'));
    el.querySelector('form.panel-actions')!.dispatchEvent(new Event('submit'));

    const req = http.expectOne(`${url}/1/estado`);
    expect(req.request.body).toEqual({ estado: 'PENDIENTE', respuesta: 'Lo sentimos' });
    req.flush({ ...claim(1, 'RESUELTO'), respuesta: 'Lo sentimos' });
    fixture.detectChanges();

    expect(el.querySelector('.toast-success')!.textContent).toContain('Cambios guardados');
    expect(el.querySelector('.rec-panel')).toBeNull();
  });

  it('muestra el error en la tarjeta si falla el guardado', () => {
    el.querySelector<HTMLButtonElement>('.rec-row')!.click();
    fixture.detectChanges();
    el.querySelector('form.panel-actions')!.dispatchEvent(new Event('submit'));
    http.expectOne(`${url}/1/estado`).flush({ message: ['estado inválido'] }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(el.querySelector('.save-feedback.error')!.textContent).toContain('estado inválido');
  });
});
