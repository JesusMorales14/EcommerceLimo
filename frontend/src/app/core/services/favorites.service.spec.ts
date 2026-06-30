import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { FavoritesService } from './favorites.service';
import { AuthService } from './auth.service';
import { type Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  name: 'Monitor LG 27"',
  brand: 'LG',
  price: 1200,
  stock: 5,
  images: ['img1.jpg'],
  colors: [],
  sizes: [],
  category: 'tecnologia',
  description: 'Monitor Full HD',
  isOffer: false,
  ...overrides,
});

describe('FavoritesService', () => {
  let service: FavoritesService;
  let http: HttpTestingController;
  let authMock: { isLoggedIn: () => boolean };
  const base = environment.apiUrl;

  function setup(isLoggedIn: boolean) {
    authMock = { isLoggedIn: () => isLoggedIn };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    });
    service = TestBed.inject(FavoritesService);
    http = TestBed.inject(HttpTestingController);
  }

  afterEach(() => http.verify());

  it('debería crearse correctamente', () => {
    setup(true);
    expect(service).toBeTruthy();
  });

  describe('estado inicial', () => {
    it('favoriteIds, favoriteItems y count están vacíos', () => {
      setup(true);
      expect(service.favoriteIds()).toEqual([]);
      expect(service.favoriteItems()).toEqual([]);
      expect(service.count()).toBe(0);
    });
  });

  describe('loadFavorites', () => {
    it('no hace ninguna petición si el usuario no está logueado', () => {
      setup(false);
      service.loadFavorites();
      http.expectNone(`${base}/favorites/ids`);
      http.expectNone(`${base}/favorites`);
    });

    it('carga ids e items y actualiza los signals', () => {
      setup(true);
      service.loadFavorites();

      const reqIds = http.expectOne(`${base}/favorites/ids`);
      const reqItems = http.expectOne(`${base}/favorites`);
      reqIds.flush([1, 2]);
      reqItems.flush([mockProduct({ id: 1 }), mockProduct({ id: 2 })]);

      expect(service.favoriteIds()).toEqual([1, 2]);
      expect(service.favoriteItems().length).toBe(2);
      expect(service.count()).toBe(2);
    });
  });

  describe('isFavorite', () => {
    it('retorna true si el id está en favoriteIds', () => {
      setup(true);
      service.loadFavorites();
      http.expectOne(`${base}/favorites/ids`).flush([1, 2]);
      http.expectOne(`${base}/favorites`).flush([]);

      expect(service.isFavorite(1)).toBe(true);
      expect(service.isFavorite(99)).toBe(false);
    });
  });

  describe('toggle', () => {
    it('no hace nada si el usuario no está logueado', () => {
      setup(false);
      service.toggle(mockProduct());
      http.expectNone(`${base}/favorites/1`);
    });

    it('agrega el producto cuando favorited es true', () => {
      setup(true);
      const product = mockProduct({ id: 7 });
      service.toggle(product);

      const req = http.expectOne(`${base}/favorites/7`);
      expect(req.request.method).toBe('POST');
      req.flush({ favorited: true, productId: 7 });

      expect(service.favoriteIds()).toContain(7);
      expect(service.favoriteItems().some(p => p.id === 7)).toBe(true);
      expect(service.count()).toBe(1);
    });

    it('remueve el producto cuando favorited es false', () => {
      setup(true);
      service.loadFavorites();
      http.expectOne(`${base}/favorites/ids`).flush([7]);
      http.expectOne(`${base}/favorites`).flush([mockProduct({ id: 7 })]);

      service.toggle(mockProduct({ id: 7 }));
      const req = http.expectOne(`${base}/favorites/7`);
      req.flush({ favorited: false, productId: 7 });

      expect(service.favoriteIds()).not.toContain(7);
      expect(service.favoriteItems().some(p => p.id === 7)).toBe(false);
      expect(service.count()).toBe(0);
    });
  });
});
