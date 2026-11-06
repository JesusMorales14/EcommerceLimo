import type { Product } from '@core/models/product.model';
import { emptyProductForm, splitList, toProductFormValue, toProductPayload } from './product-form';

const PRODUCT: Product = {
  id: 1, name: 'Polo', description: 'Algodón', price: 50, discount: 10, stock: 3, brand: 'X', category: 'moda',
  subCategory: 'polos', isOffer: true, isFeatured: false, images: ['a.jpg'], colors: ['Negro', 'Blanco'],
  sizes: ['S', 'M'], colorImages: { Negro: ['n1.jpg', 'n2.jpg'] },
};

describe('product-form mapper', () => {
  it('splitList limpia espacios y vacíos', () => {
    expect(splitList(' a, ,b ,c ')).toEqual(['a', 'b', 'c']);
    expect(splitList(undefined)).toEqual([]);
  });

  it('toProductFormValue convierte listas a texto', () => {
    const value = toProductFormValue(PRODUCT);
    expect(value.sizes).toBe('S, M');
    expect(value.colors).toBe('Negro, Blanco');
    expect(value.colorImages['Negro']).toBe('n1.jpg, n2.jpg');
  });

  it('toProductPayload usa las imágenes del primer color como principales', () => {
    const payload = toProductPayload(toProductFormValue(PRODUCT));
    expect(payload.images).toEqual(['n1.jpg', 'n2.jpg']);
    expect(payload.colorImages).toEqual({ Negro: ['n1.jpg', 'n2.jpg'] });
    expect(payload.sizes).toEqual(['S', 'M']);
  });

  it('toProductPayload usa las imágenes genéricas si no hay colores y omite opcionales vacíos', () => {
    const payload = toProductPayload({ ...emptyProductForm(), name: ' Mesa ', category: 'hogar', images: 'm1.jpg, m2.jpg' });
    expect(payload.name).toBe('Mesa');
    expect(payload.images).toEqual(['m1.jpg', 'm2.jpg']);
    expect(payload).not.toHaveProperty('discount');
    expect(payload).not.toHaveProperty('subCategory');
  });
});
