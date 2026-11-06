import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '@env/environment';
import { AdminUsersPage } from './admin-users';

const user = (id: number, role = 'USER') => ({ id, name: `usuario ${id}`, email: `u${id}@x.com`, role, createdAt: '2026-01-01' });

describe('AdminUsersPage', () => {
  let http: HttpTestingController;

  const render = async (users: unknown[]) => {
    const fixture = TestBed.createComponent(AdminUsersPage);
    fixture.detectChanges();
    TestBed.tick();
    http.expectOne(`${environment.apiUrl}/users`).flush(users);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminUsersPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('muestra el estado vacío', async () => {
    const el = await render([]);
    expect(el.querySelector('.empty-state')).toBeTruthy();
  });

  it('lista los usuarios paginados y resalta a los administradores', async () => {
    const el = await render([user(1, 'ADMIN'), ...Array.from({ length: 7 }, (_, i) => user(i + 2))]);
    expect(el.querySelectorAll('tbody tr')).toHaveLength(6);
    expect(el.querySelector('.role-badge.admin')).toBeTruthy();
    expect(el.querySelector('.user-avatar')!.textContent).toBe('U');
    expect(el.querySelector('.total-count')!.textContent).toContain('8 usuarios');
  });
});
