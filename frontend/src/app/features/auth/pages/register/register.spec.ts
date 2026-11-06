import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { environment } from '@env/environment';
import { RegisterPage } from './register';

const AUTH_RESPONSE = { token: 'tok', user: { id: 2, name: 'Ana', email: 'ana@test.com', role: 'USER' } };

describe('RegisterPage', () => {
  let fixture: ComponentFixture<RegisterPage>;
  let el: HTMLElement;
  let http: HttpTestingController;

  const fill = (selector: string, value: string) => {
    const input = el.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };
  const fillRequired = () => {
    fill('#name', 'Ana');
    fill('#email', 'ana@test.com');
    fill('#password', 'secreta1');
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(RegisterPage);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.match(() => true);
    http.verify();
    localStorage.clear();
  });

  it('exige nombre, correo y contraseña', () => {
    submit();
    expect(el.querySelector('.auth-error')!.textContent).toContain('obligatorios');
    expect(el.querySelectorAll('.field-error').length).toBeGreaterThan(0);
  });

  it('valida la longitud mínima de la contraseña', () => {
    fill('#name', 'Ana');
    fill('#email', 'ana@test.com');
    fill('#password', '123');
    submit();
    expect(el.textContent).toContain('al menos 6 caracteres');
    http.expectNone(`${environment.apiUrl}/auth/register`);
  });

  it('registra al usuario omitiendo el teléfono vacío', () => {
    fillRequired();
    submit();
    const req = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.body).toEqual({ name: 'Ana', email: 'ana@test.com', password: 'secreta1', phone: undefined });
    req.flush(AUTH_RESPONSE);
    expect(localStorage.getItem('gh_token')).toBe('tok');
  });

  it('envía el teléfono cuando se completa', () => {
    fillRequired();
    fill('#phone', '987654321');
    submit();
    const req = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.body.phone).toBe('987654321');
    req.flush(AUTH_RESPONSE);
  });

  it('muestra el error si el correo ya existe', () => {
    fillRequired();
    submit();
    http
      .expectOne(`${environment.apiUrl}/auth/register`)
      .flush({ message: 'El correo ya está registrado' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();
    expect(el.querySelector('.auth-error')!.textContent).toContain('ya está registrado');
  });
});
