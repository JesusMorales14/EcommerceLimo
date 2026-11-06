import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { environment } from '@env/environment';
import { LoginPage } from './login';

const AUTH_RESPONSE = { token: 'test-token-123', user: { id: 1, name: 'Juan', email: 'juan@test.com', role: 'USER' } };

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
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

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(LoginPage);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    http.match(() => true);
    http.verify();
    localStorage.clear();
  });

  it('valida los campos antes de enviar', () => {
    submit();
    expect(el.querySelector('.auth-error')!.textContent).toContain('Completa todos los campos');
    http.expectNone(`${environment.apiUrl}/auth/login`);
  });

  it('inicia sesión, guarda el token y redirige', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fill('#email', 'juan@test.com');
    fill('#password', 'password123');
    submit();

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.body).toEqual({ email: 'juan@test.com', password: 'password123' });
    req.flush(AUTH_RESPONSE);

    expect(localStorage.getItem('gh_token')).toBe('test-token-123');
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('muestra el error del backend si las credenciales son incorrectas', () => {
    fill('#email', 'juan@test.com');
    fill('#password', 'mala');
    submit();
    http
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
    expect(el.querySelector('.auth-error')!.textContent).toContain('Credenciales inválidas');
    expect(el.querySelector<HTMLButtonElement>('.btn-auth')!.disabled).toBe(false);
  });
});
