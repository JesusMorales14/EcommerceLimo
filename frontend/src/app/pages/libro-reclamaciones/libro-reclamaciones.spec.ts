import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LibroReclamacionesPage } from './libro-reclamaciones';
import { environment } from '../../../environments/environment';

describe('LibroReclamacionesPage', () => {
  let component: LibroReclamacionesPage;
  let fixture: ComponentFixture<LibroReclamacionesPage>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibroReclamacionesPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(LibroReclamacionesPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('inicia sin submitted ni errores', () => {
    expect(component.submitted()).toBe(false);
    expect(component.error()).toBe('');
  });

  describe('getError / hasError', () => {
    it('no retorna error si el campo no ha sido tocado', () => {
      expect(component.getError('nombre')).toBe('');
      expect(component.hasError('nombre')).toBe(false);
    });

    it('retorna error de nombre requerido si está vacío y fue tocado', () => {
      component.touch('nombre');
      component.form.nombre = '';
      expect(component.getError('nombre')).toContain('requerido');
    });

    it('retorna error de DNI si el formato es inválido', () => {
      component.touch('dni');
      component.form.dni = 'abc';
      expect(component.getError('dni')).toContain('dígitos');
    });

    it('retorna error de email si el formato es inválido', () => {
      component.touch('email');
      component.form.email = 'no-es-email';
      expect(component.getError('email')).toContain('válido');
    });

    it('retorna error de teléfono si el formato es inválido', () => {
      component.touch('telefono');
      component.form.telefono = 'abc';
      expect(component.getError('telefono')).toContain('válido');
    });

    it('retorna error de detalle si es menor a 10 caracteres', () => {
      component.touch('detalle');
      component.form.detalle = 'corto';
      expect(component.getError('detalle')).toContain('10 caracteres');
    });
  });

  describe('isFormValid', () => {
    it('retorna false cuando el formulario está vacío', () => {
      expect(component.isFormValid()).toBe(false);
    });

    it('retorna true cuando todos los campos obligatorios son válidos', () => {
      component.form.nombre    = 'Juan';
      component.form.apellidos = 'Pérez';
      component.form.dni       = '12345678';
      component.form.email     = 'juan@test.com';
      component.form.telefono  = '999123456';
      component.form.detalle   = 'El producto llegó dañado y quiero un reembolso.';
      component.form.acepta    = true;
      expect(component.isFormValid()).toBe(true);
    });

    it('retorna false si acepta es false aunque el resto sea válido', () => {
      component.form.nombre    = 'Juan';
      component.form.apellidos = 'Pérez';
      component.form.dni       = '12345678';
      component.form.email     = 'juan@test.com';
      component.form.telefono  = '999123456';
      component.form.detalle   = 'El producto llegó dañado y quiero un reembolso.';
      component.form.acepta    = false;
      expect(component.isFormValid()).toBe(false);
    });
  });

  describe('submit', () => {
    const fillForm = (comp: LibroReclamacionesPage) => {
      comp.form.nombre    = 'Juan';
      comp.form.apellidos = 'Pérez';
      comp.form.dni       = '12345678';
      comp.form.email     = 'juan@test.com';
      comp.form.telefono  = '999123456';
      comp.form.detalle   = 'El producto llegó dañado y quiero un reembolso.';
      comp.form.acepta    = true;
    };

    it('no hace llamada HTTP si el formulario es inválido', () => {
      component.submit();
      http.expectNone(`${environment.apiUrl}/reclamaciones`);
      expect(component.submitted()).toBe(false);
    });

    it('toca todos los campos al hacer submit (muestra errores)', () => {
      component.submit();
      expect(component.touched.has('nombre')).toBe(true);
      expect(component.touched.has('email')).toBe(true);
    });

    it('envía el formulario y activa submitted en caso de éxito', () => {
      fillForm(component);
      component.submit();

      const mockRec = {
        id: 1, nombre: 'Juan', apellidos: 'Pérez', dni: '12345678',
        email: 'juan@test.com', telefono: '999123456', tipo: 'RECLAMO',
        bien: 'PRODUCTO', detalle: 'El producto llegó dañado.', estado: 'PENDIENTE',
        createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
      };
      const req = http.expectOne(`${environment.apiUrl}/reclamaciones`);
      expect(req.request.method).toBe('POST');
      req.flush(mockRec);

      expect(component.submitted()).toBe(true);
      expect(component.submitting()).toBe(false);
      expect(component.submitted_rec()?.id).toBe(1);
    });

    it('muestra error y desactiva submitting si falla el envío', () => {
      fillForm(component);
      component.submit();

      http.expectOne(`${environment.apiUrl}/reclamaciones`)
        .error(new ErrorEvent('Network error'), { status: 0 });

      expect(component.submitted()).toBe(false);
      expect(component.submitting()).toBe(false);
      expect(component.error()).toContain('servidor');
    });
  });

  describe('reset', () => {
    it('restablece el formulario y el estado tras el envío', () => {
      component.submitted.set(true);
      component.error.set('algo');
      component.touch('nombre');

      component.reset();

      expect(component.submitted()).toBe(false);
      expect(component.error()).toBe('');
      expect(component.touched.size).toBe(0);
      expect(component.form.nombre).toBe('');
    });
  });
});
