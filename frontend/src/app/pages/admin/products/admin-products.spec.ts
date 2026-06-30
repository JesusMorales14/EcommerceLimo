import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminProductsPage } from './admin-products';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../core/models/product.model';

const mockProduct: Product = {
  id: 1, name: 'Zapatilla', description: 'desc', price: 100, stock: 10,
  brand: 'Nike', category: 'Calzado', isOffer: false, images: [], colors: [], sizes: [],
};

describe('AdminProductsPage', () => {
  let component: AdminProductsPage;
  let fixture: ComponentFixture<AdminProductsPage>;
  let http: HttpTestingController;

  const flushProducts = (items: Product[] = [mockProduct]) =>
    http.expectOne(r => r.url.includes('/products')).flush({
      items, total: items.length, page: 1, limit: 500, pages: 1,
    });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductsPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductsPage);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  it('debería crearse correctamente', () => {
    flushProducts([]);
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('carga los productos y desactiva loading', () => {
      flushProducts([mockProduct]);
      expect(component.products()).toEqual([mockProduct]);
      expect(component.loading()).toBe(false);
    });

    it('desactiva loading aunque haya error', () => {
      http.expectOne(r => r.url.includes('/products'))
        .error(new ErrorEvent('Network error'));
      expect(component.loading()).toBe(false);
    });
  });

  describe('filteredProducts', () => {
    beforeEach(() => flushProducts([mockProduct]));

    it('retorna todos los productos cuando no hay filtros', () => {
      expect(component.filteredProducts().length).toBe(1);
    });

    it('filtra por texto de búsqueda en nombre', () => {
      component.onSearchChange('zapatilla');
      expect(component.filteredProducts().length).toBe(1);
    });

    it('retorna vacío si la búsqueda no coincide', () => {
      component.onSearchChange('xyz-no-existe');
      expect(component.filteredProducts().length).toBe(0);
    });

    it('filtra por categoría', () => {
      component.onCategoryChange('Calzado');
      expect(component.filteredProducts().length).toBe(1);
    });

    it('retorna vacío si la categoría no coincide', () => {
      component.onCategoryChange('Electrónica');
      expect(component.filteredProducts().length).toBe(0);
    });
  });

  describe('openCreate / openEdit / closeForm', () => {
    beforeEach(() => flushProducts([mockProduct]));

    it('abre el formulario de creación', () => {
      component.openCreate();
      expect(component.showForm()).toBe(true);
      expect(component.editId()).toBeNull();
    });

    it('abre el formulario de edición con los datos del producto', () => {
      component.openEdit(mockProduct);
      expect(component.showForm()).toBe(true);
      expect(component.editId()).toBe(mockProduct.id);
      expect(component.form.name).toBe(mockProduct.name);
    });

    it('closeForm cierra el formulario', () => {
      component.openCreate();
      component.closeForm();
      expect(component.showForm()).toBe(false);
    });
  });

  describe('submit (crear)', () => {
    beforeEach(() => flushProducts([]));

    it('llama al servicio de creación y recarga los productos', () => {
      component.openCreate();
      component.form = { ...mockProduct };
      component.submit();

      const createReq = http.expectOne(`${environment.apiUrl}/products`);
      expect(createReq.request.method).toBe('POST');
      createReq.flush(mockProduct);

      flushProducts([mockProduct]);
      expect(component.saving()).toBe(false);
    });

    it('muestra error si la creación falla', () => {
      component.openCreate();
      component.submit();

      http.expectOne(`${environment.apiUrl}/products`)
        .flush({ message: 'Datos inválidos.' }, { status: 400, statusText: 'Bad Request' });
      expect(component.error()).toBe('Datos inválidos.');
      expect(component.saving()).toBe(false);
    });
  });
});
