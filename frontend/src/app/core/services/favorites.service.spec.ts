import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import type { Product } from '../models/product.model';
import { environment } from '@env/environment';
import { FavoritesService } from './favorites.service';

const base = environment.apiUrl;
const USER = { id: 1, name: 'Ana', email: 'a@a.com', role: 'USER' };
const product = (id: number) => ({ id, name: `P${id}` }) as Product;

describe('FavoritesService', () => {
  let http: HttpTestingController;

  const setup = (loggedIn: boolean) => {
    localStorage.clear();
    if (loggedIn) {
      localStorage.setItem('gh_token', 'tok');
      localStorage.setItem('gh_user', JSON.stringify(USER));
    }
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    http = TestBed.inject(HttpTestingController);
    const service = TestBed.inject(FavoritesService);
    TestBed.tick();
    return service;
  };

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('sin sesión no consulta el backend y el estado está vacío', () => {
    const service = setup(false);
    expect(service.count()).toBe(0);
    expect(service.favoriteIds()).toEqual([]);
  });

  it('con sesión carga los favoritos automáticamente', () => {
    const service = setup(true);
    http.expectOne(`${base}/favorites`).flush([product(1), product(2)]);
    expect(service.favoriteIds()).toEqual([1, 2]);
    expect(service.isFavorite(2)).toBe(true);
  });

  it('toggle agrega y quita productos según la respuesta', () => {
    const service = setup(true);
    http.expectOne(`${base}/favorites`).flush([]);

    service.toggle(product(5));
    http.expectOne(`${base}/favorites/5`).flush({ favorited: true, productId: 5 });
    expect(service.favoriteIds()).toEqual([5]);

    service.toggle(product(5));
    http.expectOne(`${base}/favorites/5`).flush({ favorited: false, productId: 5 });
    expect(service.count()).toBe(0);
  });

  it('toggle sin sesión redirige al login', () => {
    const service = setup(false);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    service.toggle(product(1));
    expect(navigate).toHaveBeenCalledWith(['/login'], { state: { redirect: '/' } });
  });
});
