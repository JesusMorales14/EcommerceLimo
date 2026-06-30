import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { type User } from '../models/user.model';
import { environment } from '../../../environments/environment';

const mockUser: User = {
  id: 1,
  name: 'Juan Pérez',
  email: 'juan@test.com',
  role: 'USER',
};

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('hace GET /users y retorna la lista de usuarios', () => {
      let result: User[] | undefined;
      service.getAll().subscribe(r => (result = r));

      const req = http.expectOne(`${base}/users`);
      expect(req.request.method).toBe('GET');
      req.flush([mockUser]);

      expect(result?.length).toBe(1);
      expect(result?.[0].email).toBe('juan@test.com');
    });

    it('maneja una lista vacía', () => {
      let result: User[] | undefined;
      service.getAll().subscribe(r => (result = r));

      http.expectOne(`${base}/users`).flush([]);

      expect(result).toEqual([]);
    });

    it('propaga error HTTP si la petición falla', () => {
      let errorResult: unknown;
      service.getAll().subscribe({ error: (e) => (errorResult = e) });

      http.expectOne(`${base}/users`).flush(
        { message: 'No autorizado' },
        { status: 403, statusText: 'Forbidden' }
      );

      expect((errorResult as { status: number }).status).toBe(403);
    });
  });

  describe('getOne', () => {
    it('hace GET /users/:id y retorna el usuario', () => {
      let result: User | undefined;
      service.getOne(1).subscribe(r => (result = r));

      const req = http.expectOne(`${base}/users/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);

      expect(result).toEqual(mockUser);
    });

    it('propaga error 404 si el usuario no existe', () => {
      let errorResult: unknown;
      service.getOne(999).subscribe({ error: (e) => (errorResult = e) });

      http.expectOne(`${base}/users/999`).flush(
        { message: 'No encontrado' },
        { status: 404, statusText: 'Not Found' }
      );

      expect((errorResult as { status: number }).status).toBe(404);
    });
  });
});
