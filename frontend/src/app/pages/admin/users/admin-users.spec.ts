import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminUsersPage } from './admin-users';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';

const mockUser: User = { id: 1, name: 'Juan', email: 'juan@test.com', role: 'USER' };
const mockAdmin: User = { id: 2, name: 'Admin', email: 'admin@test.com', role: 'ADMIN' };

describe('AdminUsersPage', () => {
  let component: AdminUsersPage;
  let fixture: ComponentFixture<AdminUsersPage>;
  let http: HttpTestingController;

  const flushUsers = (users: User[] = [mockUser, mockAdmin]) =>
    http.expectOne(`${environment.apiUrl}/users`).flush(users);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('debería crearse correctamente', () => {
    flushUsers([]);
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('carga los usuarios y desactiva loading', () => {
      flushUsers([mockUser, mockAdmin]);
      expect(component.users()).toEqual([mockUser, mockAdmin]);
      expect(component.loading()).toBe(false);
    });

    it('desactiva loading aunque haya error', () => {
      http.expectOne(`${environment.apiUrl}/users`)
        .error(new ErrorEvent('Network error'));
      expect(component.loading()).toBe(false);
    });
  });

  describe('paginación', () => {
    beforeEach(() => flushUsers([mockUser, mockAdmin]));

    it('pagedUsers contiene los usuarios de la primera página', () => {
      expect(component.pagedUsers().length).toBeGreaterThanOrEqual(1);
    });

    it('goToPage cambia la página actual', () => {
      component.goToPage(1);
      expect(component.currentPage()).toBe(1);
    });

    it('goToPage ignora páginas fuera de rango', () => {
      component.goToPage(0);
      expect(component.currentPage()).toBe(1);
    });
  });
});
