import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '@env/environment';
import { LibroReclamacionesPage } from './libro-reclamaciones';

const url = `${environment.apiUrl}/reclamaciones`;

describe('LibroReclamacionesPage', () => {
  let fixture: ComponentFixture<LibroReclamacionesPage>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const fill = (selector: string, value: string) => {
    const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };
  const fillValid = () => {
    fill('#nombre', 'Ana');
    fill('#apellidos', 'Pérez');
    fill('#dni', '12345678');
    fill('#telefono', '987654321');
    fill('#email', 'ana@test.com');
    fill('#detalle', 'Llegó dañado el producto');
    const accept = el.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    accept.click();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LibroReclamacionesPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(LibroReclamacionesPage);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('muestra los errores de validación y no envía si el formulario es inválido', () => {
    submit();
    http.expectNone(url);
    const messages = [...el.querySelectorAll('.field-msg')].map((m) => m.textContent);
    expect(messages).toContain('El nombre es requerido.');
    expect(messages).toContain('Debes aceptar la declaración para continuar.');
  });

  it('envía la reclamación y muestra la confirmación', () => {
    fillValid();
    submit();
    const req = http.expectOne(url);
    expect(req.request.body).toMatchObject({ nombre: 'Ana', tipo: 'RECLAMO', bien: 'PRODUCTO' });
    expect(req.request.body).not.toHaveProperty('acepta');
    req.flush({ id: 42, email: 'ana@test.com' });
    fixture.detectChanges();

    expect(el.querySelector('.ref-badge')!.textContent).toContain('#42');
    el.querySelector<HTMLButtonElement>('.btn-new')!.click();
    fixture.detectChanges();
    expect(el.querySelector('app-claim-form')).toBeTruthy();
  });

  it('muestra el error del servidor', () => {
    fillValid();
    submit();
    http.expectOne(url).flush({ message: ['dni inválido'] }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(el.querySelector('.form-error')!.textContent).toContain('dni inválido');
  });
});
