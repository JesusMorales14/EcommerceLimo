import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const mockUser = { id: 1, name: 'Juan Pérez', email: 'juan@test.com', role: 'USER' as const };
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // ── Estado inicial ───────────────────────────────────────────────────────────

  describe('estado inicial', () => {
    it('isLoggedIn es false sin sesión guardada', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('isAdmin es false sin sesión guardada', () => {
      expect(service.isAdmin()).toBe(false);
    });

    it('user() es null sin sesión guardada', () => {
      expect(service.user()).toBeNull();
    });

    it('getToken() retorna null sin sesión guardada', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  // ── login ────────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('guarda token y usuario después de un login exitoso', () => {
      service.login('juan@test.com', '123456').subscribe();

      const req = http.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ token: mockToken, user: mockUser });

      expect(service.isLoggedIn()).toBe(true);
      expect(service.user()?.email).toBe('juan@test.com');
      expect(service.getToken()).toBe(mockToken);
      expect(localStorage.getItem('gh_token')).toBe(mockToken);
    });

    it('isAdmin es true si el usuario tiene rol ADMIN', () => {
      const adminUser = { ...mockUser, role: 'ADMIN' as const };
      service.login('admin@test.com', 'password').subscribe();

      const req = http.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ token: mockToken, user: adminUser });

      expect(service.isAdmin()).toBe(true);
    });
  });

  // ── logout ───────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('limpia el estado y el localStorage', () => {
      localStorage.setItem('gh_token', mockToken);
      localStorage.setItem('gh_user', JSON.stringify(mockUser));

      service.login('juan@test.com', '123456').subscribe();
      http.expectOne(`${environment.apiUrl}/auth/login`).flush({ token: mockToken, user: mockUser });

      service.logout();

      expect(service.isLoggedIn()).toBe(false);
      expect(service.user()).toBeNull();
      expect(service.getToken()).toBeNull();
      expect(localStorage.getItem('gh_token')).toBeNull();
      expect(localStorage.getItem('gh_user')).toBeNull();
    });
  });

  // ── updateLocalUser ──────────────────────────────────────────────────────────

  describe('updateLocalUser', () => {
    it('actualiza nombre y persiste en localStorage', () => {
      service.login('juan@test.com', '123456').subscribe();
      http.expectOne(`${environment.apiUrl}/auth/login`).flush({ token: mockToken, user: mockUser });

      service.updateLocalUser({ name: 'Juan Actualizado' });

      expect(service.user()?.name).toBe('Juan Actualizado');
      const stored = JSON.parse(localStorage.getItem('gh_user')!);
      expect(stored.name).toBe('Juan Actualizado');
    });
  });

  // ── restoreUser ──────────────────────────────────────────────────────────────

  describe('restauración de sesión', () => {
    it('restaura el usuario desde localStorage al crear el servicio', () => {
      localStorage.setItem('gh_token', mockToken);
      localStorage.setItem('gh_user', JSON.stringify(mockUser));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      });
      const freshService = TestBed.inject(AuthService);

      expect(freshService.isLoggedIn()).toBe(true);
      expect(freshService.user()?.name).toBe('Juan Pérez');
    });

    it('no falla si gh_user contiene JSON inválido', () => {
      localStorage.setItem('gh_user', 'invalid-json');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      });
      const freshService = TestBed.inject(AuthService);
      expect(freshService.isLoggedIn()).toBe(false);
    });
  });
});
