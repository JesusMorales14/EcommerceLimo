import type { Product } from '../models/product.model';
import { groupSearchResults, matchesWordStart } from './search-grouping';

const p = (id: number, name: string, brand: string) => ({ id, name, brand }) as Product;

describe('search-grouping', () => {
  it('matchesWordStart solo coincide al inicio de palabra', () => {
    expect(matchesWordStart('Smart TV LG', 'lg')).toBe(true);
    expect(matchesWordStart('Bulgari', 'lg')).toBe(false);
    expect(matchesWordStart(undefined, 'x')).toBe(false);
  });

  it('agrupa por marca y excluye esos productos del listado por nombre', () => {
    const items = [p(1, 'Televisor', 'LG'), p(2, 'Lavadora LG', 'Samsung'), p(3, 'Monitor LG', 'LG')];
    const result = groupSearchResults(items, 'lg');
    expect(result.brands).toEqual([{ name: 'LG', products: [items[0], items[2]] }]);
    expect(result.products).toEqual([items[1]]);
  });
});
