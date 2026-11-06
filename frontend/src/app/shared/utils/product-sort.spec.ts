import type { Product } from '@core/models/product.model';
import { sortProducts } from './product-sort';

const make = (id: number, name: string, price: number, discount?: number) =>
  ({ id, name, price, discount }) as Product;

describe('sortProducts', () => {
  const list = [make(1, 'Zapato', 100), make(2, 'Abrigo', 300, 50), make(3, 'Mesa', 200)];

  it('relevance mantiene el orden original sin mutar el arreglo', () => {
    const result = sortProducts(list, 'relevance');
    expect(result.map((p) => p.id)).toEqual([1, 2, 3]);
    expect(result).not.toBe(list);
  });

  it('ordena por precio final (con descuento)', () => {
    expect(sortProducts(list, 'price-asc').map((p) => p.id)).toEqual([1, 2, 3]);
    expect(sortProducts(list, 'price-desc').map((p) => p.id)).toEqual([3, 2, 1]);
  });

  it('ordena alfabéticamente', () => {
    expect(sortProducts(list, 'name-asc').map((p) => p.name)).toEqual(['Abrigo', 'Mesa', 'Zapato']);
  });
});
