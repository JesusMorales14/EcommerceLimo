import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ReclamacionService } from './reclamacion.service';
import { type Reclamacion } from '../models/reclamacion.model';
import { environment } from '../../../environments/environment';

const mockReclamacion: Reclamacion = {
  id: 1,
  nombre: 'Juan',
  apellidos: 'Pérez',
  dni: '12345678',
  email: 'juan@test.com',
  telefono: '999999999',
  tipo: 'RECLAMO',
  bien: 'PRODUCTO',
  detalle: 'El producto llegó dañado',
  estado: 'PENDIENTE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ReclamacionService', () => {
  let service: ReclamacionService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReclamacionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('hace POST /reclamaciones con los datos proporcionados', () => {
      const data: Partial<Reclamacion> = { nombre: 'Juan', detalle: 'Producto dañado' };
      let result: Reclamacion | undefined;
      service.create(data).subscribe(r => (result = r));

      const req = http.expectOne(`${base}/reclamaciones`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      req.flush(mockReclamacion);

      expect(result).toEqual(mockReclamacion);
    });

    it('propaga error si los datos son inválidos', () => {
      let errorResult: unknown;
      service.create({}).subscribe({ error: (e) => (errorResult = e) });

      http.expectOne(`${base}/reclamaciones`).flush(
        { message: 'Datos inválidos' },
        { status: 422, statusText: 'Unprocessable Entity' }
      );

      expect((errorResult as { status: number }).status).toBe(422);
    });
  });

  describe('getMine', () => {
    it('hace GET /reclamaciones/mine y retorna la lista', () => {
      let result: Reclamacion[] | undefined;
      service.getMine().subscribe(r => (result = r));

      const req = http.expectOne(`${base}/reclamaciones/mine`);
      expect(req.request.method).toBe('GET');
      req.flush([mockReclamacion]);

      expect(result?.length).toBe(1);
    });

    it('maneja una lista vacía', () => {
      let result: Reclamacion[] | undefined;
      service.getMine().subscribe(r => (result = r));

      http.expectOne(`${base}/reclamaciones/mine`).flush([]);

      expect(result).toEqual([]);
    });
  });

  describe('getAll', () => {
    it('hace GET /reclamaciones/all y retorna la lista', () => {
      let result: Reclamacion[] | undefined;
      service.getAll().subscribe(r => (result = r));

      const req = http.expectOne(`${base}/reclamaciones/all`);
      expect(req.request.method).toBe('GET');
      req.flush([mockReclamacion]);

      expect(result?.length).toBe(1);
    });
  });

  describe('updateEstado', () => {
    it('hace PATCH /reclamaciones/:id/estado con estado y respuesta', () => {
      service.updateEstado(1, 'RESUELTO', 'Solucionado').subscribe();

      const req = http.expectOne(`${base}/reclamaciones/1/estado`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ estado: 'RESUELTO', respuesta: 'Solucionado' });
      req.flush({ ...mockReclamacion, estado: 'RESUELTO' });
    });

    it('hace PATCH sin respuesta cuando no se provee', () => {
      service.updateEstado(1, 'EN_REVISION').subscribe();

      const req = http.expectOne(`${base}/reclamaciones/1/estado`);
      expect(req.request.body).toEqual({ estado: 'EN_REVISION', respuesta: undefined });
      req.flush({ ...mockReclamacion, estado: 'EN_REVISION' });
    });
  });
});
