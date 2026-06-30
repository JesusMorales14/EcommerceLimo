import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService, type Category } from './category.service';
import { environment } from '../../../environments/environment';

const mockCategories: Category[] = [
  { id: 'tecnologia', label: 'Tecnología', icon: 'tv', desc: 'Productos tech', subCategories: [{ id: 'monitores', label: 'Monitores' }] },
  { id: 'hogar', label: 'Hogar', icon: 'home', desc: 'Productos hogar', subCategories: [] },
];

describe('CategoryService', () => {
  let service: CategoryService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('estado inicial', () => {
    it('categories() está vacío antes de cargar', () => {
      expect(service.categories()).toEqual([]);
    });
  });

  describe('load', () => {
    it('hace GET /categories y actualiza el signal categories', () => {
      service.load();

      const req = http.expectOne(`${base}/categories`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCategories);

      expect(service.categories()).toEqual(mockCategories);
      expect(service.categories().length).toBe(2);
    });

    it('maneja un arreglo vacío correctamente', () => {
      service.load();
      const req = http.expectOne(`${base}/categories`);
      req.flush([]);

      expect(service.categories()).toEqual([]);
    });
  });

  describe('findById', () => {
    it('retorna la categoría correspondiente si existe', () => {
      service.load();
      http.expectOne(`${base}/categories`).flush(mockCategories);

      expect(service.findById('hogar')).toEqual(mockCategories[1]);
    });

    it('retorna undefined si no existe la categoría', () => {
      service.load();
      http.expectOne(`${base}/categories`).flush(mockCategories);

      expect(service.findById('inexistente')).toBeUndefined();
    });

    it('retorna undefined si no se ha cargado ninguna categoría', () => {
      expect(service.findById('tecnologia')).toBeUndefined();
    });
  });
});
