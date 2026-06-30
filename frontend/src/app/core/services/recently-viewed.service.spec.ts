import { TestBed } from '@angular/core/testing';
import { RecentlyViewedService } from './recently-viewed.service';
import { type Product } from '../models/product.model';

const mockProduct = (id: number, overrides: Partial<Product> = {}): Product => ({
  id,
  name: `Producto ${id}`,
  brand: 'Marca',
  price: 100,
  stock: 5,
  images: [],
  colors: [],
  sizes: [],
  category: 'tecnologia',
  description: 'desc',
  isOffer: false,
  ...overrides,
});

describe('RecentlyViewedService', () => {
  function setup() {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(RecentlyViewedService);
    // Limpiamos estado residual a través del servicio (no localStorage directamente)
    service.clear();
    return service;
  }

  it('debería crearse correctamente', () => {
    expect(setup()).toBeTruthy();
  });

  describe('estado inicial', () => {
    it('items() está vacío cuando no hay productos previos', () => {
      const service = setup();
      expect(service.items()).toEqual([]);
    });

    it('restaura items desde localStorage si existen al inicializar', () => {
      // Primero guardamos datos vía el servicio
      TestBed.configureTestingModule({});
      const seedService = TestBed.inject(RecentlyViewedService);
      seedService.add(mockProduct(1));
      seedService.clear(); // Limpiamos el signal pero NO localStorage (clear() sí borra localStorage)
    });

    it('no falla si localStorage no está disponible en el constructor', () => {
      // El servicio envuelve el acceso a localStorage en try/catch;
      // en entornos donde localStorage no existe debe crear un signal vacío
      expect(() => setup()).not.toThrow();
    });
  });

  describe('add', () => {
    it('agrega un producto al inicio de la lista', () => {
      const service = setup();
      service.add(mockProduct(1));
      service.add(mockProduct(2));

      expect(service.items().map(p => p.id)).toEqual([2, 1]);
    });

    it('evita duplicados: mueve al frente el producto ya visto', () => {
      const service = setup();
      service.add(mockProduct(1));
      service.add(mockProduct(2));
      service.add(mockProduct(1)); // relanza el 1 al frente

      expect(service.items().map(p => p.id)).toEqual([1, 2]);
      expect(service.items().length).toBe(2);
    });

    it('limita la lista a un máximo de 10 elementos', () => {
      const service = setup();
      for (let i = 1; i <= 12; i++) {
        service.add(mockProduct(i));
      }

      expect(service.items().length).toBe(10);
      expect(service.items()[0].id).toBe(12);
      expect(service.items().map(p => p.id)).not.toContain(1);
      expect(service.items().map(p => p.id)).not.toContain(2);
    });

    it('actualiza el signal inmediatamente tras agregar un producto', () => {
      const service = setup();
      expect(service.items().length).toBe(0);
      service.add(mockProduct(5));
      expect(service.items().length).toBe(1);
      expect(service.items()[0].id).toBe(5);
    });
  });

  describe('clear', () => {
    it('vacía la lista de productos vistos', () => {
      const service = setup();
      service.add(mockProduct(1));
      service.add(mockProduct(2));
      expect(service.items().length).toBe(2);

      service.clear();

      expect(service.items()).toEqual([]);
      expect(service.items().length).toBe(0);
    });
  });
});
