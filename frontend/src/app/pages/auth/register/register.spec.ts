import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RegisterPage } from './register';
import { environment } from '../../../../environments/environment';

const mockAuthResponse = {
  token: 'new-token-456',
  user: { id: 2, name: 'María', email: 'maria@test.com', role: 'USER' as const },
};

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
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
    it('muestra error si nombre, email o password están vacíos', () => {
      component.name     = '';
      component.email    = '';
      component.password = '';
      component.submit();
      expect(component.error()).toContain('obligatorios');
      expect(component.loading()).toBe(false);
    });

    it('muestra error si solo falta el nombre', () => {
      component.name     = '';
      component.email    = 'maria@test.com';
      component.password = 'password123';
      component.submit();
      expect(component.error()).toBeTruthy();
    });

    it('registra el usuario y guarda la sesión al tener éxito', () => {
      component.name     = 'María';
      component.email    = 'maria@test.com';
      component.password = 'password123';
      component.submit();

      const req = http.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'María', email: 'maria@test.com', password: 'password123' });
      req.flush(mockAuthResponse);

      const favsReq = http.expectOne(r => r.url.includes('/favorites/ids'));
      favsReq.flush([]);
      const favsItemsReq = http.expectOne(r => r.url.includes('/favorites'));
      favsItemsReq.flush([]);

      expect(localStorage.getItem('gh_token')).toBe('new-token-456');
    });

    it('envía el teléfono opcional cuando está definido', () => {
      component.name     = 'María';
      component.email    = 'maria@test.com';
      component.password = 'password123';
      component.phone    = '999000111';
      component.submit();

      const req = http.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.body).toEqual({ name: 'María', email: 'maria@test.com', password: 'password123', phone: '999000111' });
      req.flush(mockAuthResponse);

      http.expectOne(r => r.url.includes('/favorites/ids')).flush([]);
      http.expectOne(r => r.url.includes('/favorites')).flush([]);
    });

    it('muestra error y desactiva loading si el email ya está registrado', () => {
      component.name     = 'María';
      component.email    = 'duplicado@test.com';
      component.password = 'password123';
      component.submit();

      http.expectOne(`${environment.apiUrl}/auth/register`)
        .error(new ErrorEvent('error'), { status: 409, statusText: 'Conflict' });

      expect(component.error()).toBeTruthy();
      expect(component.loading()).toBe(false);
    });
  });
});
