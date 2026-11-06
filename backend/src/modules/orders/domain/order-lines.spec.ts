import type { Product } from '@prisma/client';
import {
  buildOrderLines,
  mergeItems,
  OrderValidationError,
  subtotalOf,
  unitPrice,
} from './order-lines';

const product = (id: number, overrides: Partial<Product> = {}) =>
  ({
    id,
    name: `P${id}`,
    price: 100,
    discount: null,
    stock: 5,
    ...overrides,
  }) as Product;

describe('order-lines', () => {
  it('unitPrice aplica el descuento del producto', () => {
    expect(unitPrice({ price: 199.9, discount: 10 })).toBe(179.91);
    expect(unitPrice({ price: 50, discount: null })).toBe(50);
  });

  it('mergeItems suma cantidades de productos repetidos', () => {
    expect(
      mergeItems([
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 1 },
        { productId: 1, quantity: 2 },
      ]),
    ).toEqual([
      { productId: 1, quantity: 3 },
      { productId: 2, quantity: 1 },
    ]);
  });

  it('buildOrderLines usa el precio del catálogo y calcula el subtotal', () => {
    const lines = buildOrderLines(
      [{ productId: 1, quantity: 2 }],
      [product(1, { discount: 50 })],
    );
    expect(lines).toEqual([{ productId: 1, quantity: 2, price: 50 }]);
    expect(subtotalOf(lines)).toBe(100);
  });

  it('valida existencia y stock', () => {
    expect(() => buildOrderLines([{ productId: 9, quantity: 1 }], [])).toThrow(
      OrderValidationError,
    );
    expect(() =>
      buildOrderLines([{ productId: 1, quantity: 6 }], [product(1)]),
    ).toThrow('Stock insuficiente');
  });
});
