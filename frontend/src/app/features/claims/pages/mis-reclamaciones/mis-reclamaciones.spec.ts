import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { isReclamacionStepDone } from '@core/models/reclamacion.model';
import { environment } from '@env/environment';
import { MisReclamacionesPage } from './mis-reclamaciones';

const CLAIM = {
  id: 7, tipo: 'RECLAMO', bien: 'PRODUCTO', estado: 'EN_REVISION', detalle: 'Llegó roto',
  respuesta: null, createdAt: '2026-01-01T00:00:00Z',
};

describe('MisReclamacionesPage', () => {
  let fixture: ComponentFixture<MisReclamacionesPage>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const render = async (claims: unknown[]) => {
    fixture = TestBed.createComponent(MisReclamacionesPage);
    el = fixture.nativeElement;
    fixture.detectChanges();
    TestBed.tick();
    http.expectOne(`${environment.apiUrl}/reclamaciones/mine`).flush(claims);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MisReclamacionesPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('muestra el estado vacío', async () => {
    await render([]);
    expect(el.querySelector('.empty-state')).toBeTruthy();
  });

  it('lista las reclamaciones y expande el detalle al hacer clic', async () => {
    await render([CLAIM]);
    expect(el.querySelector('.estado-badge')!.textContent).toContain('En revisión');
    const header = el.querySelector<HTMLButtonElement>('.rec-header')!;
    expect(header.getAttribute('aria-expanded')).toBe('false');

    header.click();
    fixture.detectChanges();
    expect(el.querySelector('.rec-detail')!.textContent).toContain('Llegó roto');
    expect(el.querySelector('.pending-response')).toBeTruthy();

    header.click();
    fixture.detectChanges();
    expect(el.querySelector('.rec-detail')).toBeNull();
  });

  it('isReclamacionStepDone compara la posición de los estados', () => {
    expect(isReclamacionStepDone('RESUELTO', 'PENDIENTE')).toBe(true);
    expect(isReclamacionStepDone('PENDIENTE', 'PENDIENTE')).toBe(false);
  });
});
