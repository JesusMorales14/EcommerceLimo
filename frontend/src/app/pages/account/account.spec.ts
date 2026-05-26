import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AccountPage } from './account';
import { environment } from '../../../environments/environment';

const mockUser = {
  id: 1, name: 'Juan Pérez', email: 'juan@test.com',
  role: 'USER' as const, phone: '999123456', address: 'Av. Perú 123',
};

const mockOrder = {
  id: 1, status: 'PENDING' as const, total: 150,
  createdAt: '2024-01-01T00:00:00Z', userId: 1, items: [],
};

describe('AccountPage', () => {
  let component: AccountPage;
  let fixture:   ComponentFixture<AccountPage>;
  let http:      HttpTestingController;

  const flushOrders = (orders = [mockOrder]) =>
    http.expectOne(`${environment.apiUrl}/orders/mine`).flush(orders);

  beforeEach(async () => {
    localStorage.setItem('gh_token', 'test-token');
    localStorage.setItem('gh_user', JSON.stringify(mockUser));

    await TestBed.configureTestingModule({
      imports:   [AccountPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture   = TestBed.createComponent(AccountPage);
    component = fixture.componentInstance;
    http      = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('debería crearse correctamente', () => {
    flushOrders([]);
    expect(component).toBeTruthy();
  });

  // ── ngOnInit ──────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('carga los pedidos y desactiva loading', () => {
      flushOrders([mockOrder]);
      expect(component.orders()).toEqual([mockOrder]);
      expect(component.loading()).toBe(false);
    });

    it('desactiva loading aunque haya un error', () => {
      http.expectOne(`${environment.apiUrl}/orders/mine`)
        .error(new ErrorEvent('Network error'));
      expect(component.loading()).toBe(false);
    });
  });

  // ── openEdit / cancelEdit ────────────────────────────────────────────────────

  describe('openEdit / cancelEdit', () => {
    it('openEdit activa editMode y rellena los campos del usuario', () => {
      flushOrders([]);
      component.openEdit();
      expect(component.editMode()).toBe(true);
      expect(component.editName).toBe(mockUser.name);
      expect(component.editPhone).toBe(mockUser.phone);
      expect(component.editAddress).toBe(mockUser.address);
    });

    it('cancelEdit desactiva editMode', () => {
      flushOrders([]);
      component.openEdit();
      component.cancelEdit();
      expect(component.editMode()).toBe(false);
    });
  });

  // ── saveProfile ───────────────────────────────────────────────────────────────

  describe('saveProfile', () => {
    it('envía los datos y cierra editMode al tener éxito', () => {
      flushOrders([]);
      component.openEdit();
      component.editName    = 'Juan Nuevo';
      component.editPhone   = '998765432';
      component.editAddress = 'Av. Lima 456';
      component.saveProfile();

      const req = http.expectOne(`${environment.apiUrl}/auth/profile`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ name: 'Juan Nuevo', phone: '998765432', address: 'Av. Lima 456' });
      req.flush({ ...mockUser, name: 'Juan Nuevo' });

      expect(component.saving()).toBe(false);
      expect(component.editMode()).toBe(false);
    });

    it('desactiva saving si hay error al guardar', () => {
      flushOrders([]);
      component.openEdit();
      component.saveProfile();

      http.expectOne(`${environment.apiUrl}/auth/profile`)
        .error(new ErrorEvent('Server error'));

      expect(component.saving()).toBe(false);
    });
  });

  // ── isStepDone ────────────────────────────────────────────────────────────────

  describe('isStepDone', () => {
    beforeEach(() => flushOrders([]));

    it('retorna true si el estado actual está después del paso', () => {
      expect(component.isStepDone('PROCESSING', 'PENDING')).toBe(true);
      expect(component.isStepDone('DELIVERED',  'SHIPPING')).toBe(true);
    });

    it('retorna false si el estado actual está en el mismo paso', () => {
      expect(component.isStepDone('PENDING', 'PENDING')).toBe(false);
    });

    it('retorna false si el estado actual está antes del paso', () => {
      expect(component.isStepDone('PENDING',    'PROCESSING')).toBe(false);
      expect(component.isStepDone('PROCESSING', 'DELIVERED')).toBe(false);
    });
  });
});
