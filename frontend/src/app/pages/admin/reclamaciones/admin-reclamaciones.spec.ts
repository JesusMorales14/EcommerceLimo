import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminReclamacionesPage } from './admin-reclamaciones';
import { environment } from '../../../../environments/environment';
import { Reclamacion } from '../../../core/models/reclamacion.model';

const mockRec: Reclamacion = {
  id: 1, nombre: 'Juan', apellidos: 'Pérez', dni: '12345678',
  email: 'juan@test.com', telefono: '999123456', tipo: 'RECLAMO',
  bien: 'PRODUCTO', detalle: 'Producto dañado', estado: 'PENDIENTE',
  createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
};

describe('AdminReclamacionesPage', () => {
  let component: AdminReclamacionesPage;
  let fixture: ComponentFixture<AdminReclamacionesPage>;
  let http: HttpTestingController;

  const flushAll = (recs: Reclamacion[] = [mockRec]) =>
    http.expectOne(`${environment.apiUrl}/reclamaciones/all`).flush(recs);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReclamacionesPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminReclamacionesPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('debería crearse correctamente', () => {
    flushAll([]);
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('carga todas las reclamaciones y desactiva loading', () => {
      flushAll([mockRec]);
      expect(component.all()).toEqual([mockRec]);
      expect(component.loading()).toBe(false);
    });

    it('desactiva loading aunque haya error', () => {
      http.expectOne(`${environment.apiUrl}/reclamaciones/all`)
        .error(new ErrorEvent('Network error'));
      expect(component.loading()).toBe(false);
    });
  });

  describe('filtered / filter', () => {
    beforeEach(() => flushAll([mockRec]));

    it('muestra todas las reclamaciones con filtro TODOS', () => {
      component.filter.set('TODOS');
      expect(component.filtered()).toEqual([mockRec]);
    });

    it('filtra por estado PENDIENTE', () => {
      component.filter.set('PENDIENTE');
      expect(component.filtered().every(r => r.estado === 'PENDIENTE')).toBe(true);
    });

    it('retorna vacío si no hay reclamaciones del estado filtrado', () => {
      component.filter.set('RESUELTO');
      expect(component.filtered()).toEqual([]);
    });
  });

  describe('toggleExpand', () => {
    beforeEach(() => flushAll([mockRec]));

    it('expande la reclamación seleccionada', () => {
      component.toggleExpand(1, mockRec);
      expect(component.expanded()).toBe(1);
    });

    it('colapsa la reclamación si ya estaba expandida', () => {
      component.toggleExpand(1, mockRec);
      component.toggleExpand(1, mockRec);
      expect(component.expanded()).toBeNull();
    });

    it('inicializa respuesta y estado al expandir', () => {
      component.toggleExpand(1, mockRec);
      expect(component.selectedEstados[1]).toBe('PENDIENTE');
    });
  });

  describe('save', () => {
    beforeEach(() => {
      flushAll([mockRec]);
      component.toggleExpand(1, mockRec);
    });

    it('envía la actualización de estado y limpia el expand', () => {
      component.selectedEstados[1] = 'EN_REVISION';
      component.save(mockRec);

      const req = http.expectOne(`${environment.apiUrl}/reclamaciones/1/estado`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ ...mockRec, estado: 'EN_REVISION' });

      expect(component.expanded()).toBeNull();
      expect(component.updating()).toBeNull();
    });

    it('muestra error si la actualización falla', () => {
      component.save(mockRec);
      http.expectOne(`${environment.apiUrl}/reclamaciones/1/estado`)
        .error(new ErrorEvent('Server error'), { status: 500, statusText: 'Server Error' });
      expect(component.errorId()).toBe(1);
      expect(component.updating()).toBeNull();
    });
  });
});
