import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LoginPage } from './login';
import { environment } from '../../../../environments/environment';

const mockAuthResponse = {
  token: 'test-token-123',
  user: { id: 1, name: 'Juan', email: 'juan@test.com', role: 'USER' as const },
};

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('inicia sin loading ni error', () => {
    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('');
  });

  describe('submit', () => {
    it('muestra error si email o password están vacíos', () => {
      component.email    = '';
      component.password = '';
      component.submit();
      expect(component.error()).toContain('Completa');
      expect(component.loading()).toBe(false);
    });

    it('muestra error si solo falta la contraseña', () => {
      component.email    = 'test@test.com';
      component.password = '';
      component.submit();
      expect(component.error()).toBeTruthy();
    });

    it('envía el login y guarda la sesión al tener éxito', () => {
      component.email    = 'juan@test.com';
      component.password = 'password123';
      component.submit();

      const loginReq = http.expectOne(`${environment.apiUrl}/auth/login`);
      expect(loginReq.request.method).toBe('POST');
      expect(loginReq.request.body).toEqual({ email: 'juan@test.com', password: 'password123' });
      loginReq.flush(mockAuthResponse);

      const favsReq = http.expectOne(r => r.url.includes('/favorites/ids'));
      favsReq.flush([]);
      const favsItemsReq = http.expectOne(r => r.url.includes('/favorites'));
      favsItemsReq.flush([]);

      expect(localStorage.getItem('gh_token')).toBe('test-token-123');
    });

    it('muestra error y desactiva loading si las credenciales son incorrectas', () => {
      component.email    = 'juan@test.com';
      component.password = 'wrongpass';
      component.submit();

      http.expectOne(`${environment.apiUrl}/auth/login`)
        .error(new ErrorEvent('error'), { status: 401, statusText: 'Unauthorized' });

      expect(component.error()).toBeTruthy();
      expect(component.loading()).toBe(false);
    });
  });
});
