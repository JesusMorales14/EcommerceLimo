import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MisReclamacionesPage } from './mis-reclamaciones';
import { environment } from '../../../environments/environment';
import { Reclamacion } from '../../core/models/reclamacion.model';

const mockRec: Reclamacion = {
  id: 1, nombre: 'Juan', apellidos: 'Pérez', dni: '12345678',
  email: 'juan@test.com', telefono: '999123456', tipo: 'RECLAMO',
  bien: 'PRODUCTO', detalle: 'Producto dañado', estado: 'PENDIENTE',
  createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
};

describe('MisReclamacionesPage', () => {
  let component: MisReclamacionesPage;
  let fixture: ComponentFixture<MisReclamacionesPage>;
  let http: HttpTestingController;

  const flushRecs = (recs: Reclamacion[] = [mockRec]) =>
    http.expectOne(`${environment.apiUrl}/reclamaciones/mine`).flush(recs);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisReclamacionesPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MisReclamacionesPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('debería crearse correctamente', () => {
    flushRecs([]);
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('carga las reclamaciones y desactiva loading', () => {
      flushRecs([mockRec]);
      expect(component.reclamaciones()).toEqual([mockRec]);
      expect(component.loading()).toBe(false);
    });

    it('desactiva loading aunque haya error', () => {
      http.expectOne(`${environment.apiUrl}/reclamaciones/mine`)
        .error(new ErrorEvent('Network error'));
      expect(component.loading()).toBe(false);
    });
  });

  describe('toggleExpand', () => {
    beforeEach(() => flushRecs([mockRec]));

    it('expande una reclamación al hacer click en ella', () => {
      component.toggleExpand(1);
      expect(component.expanded()).toBe(1);
    });

    it('colapsa la reclamación si ya estaba expandida', () => {
      component.toggleExpand(1);
      component.toggleExpand(1);
      expect(component.expanded()).toBeNull();
    });
  });

  describe('isStepDone / isStepActive', () => {
    beforeEach(() => flushRecs([]));

    it('isStepDone retorna true si el estado actual está después del paso', () => {
      expect(component.isStepDone('EN_REVISION', 'PENDIENTE')).toBe(true);
    });

    it('isStepDone retorna false si el estado actual es el mismo paso', () => {
      expect(component.isStepDone('PENDIENTE', 'PENDIENTE')).toBe(false);
    });

    it('isStepActive retorna true si el estado actual coincide con el paso', () => {
      expect(component.isStepActive('PENDIENTE', 'PENDIENTE')).toBe(true);
    });

    it('isStepActive retorna false si el estado actual no coincide', () => {
      expect(component.isStepActive('RESUELTO', 'PENDIENTE')).toBe(false);
    });
  });
});
