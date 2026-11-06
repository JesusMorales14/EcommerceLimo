import { discountedPrice, installmentAmount } from './pricing';

describe('pricing utils', () => {
  it('discountedPrice devuelve el precio original si no hay descuento', () => {
    expect(discountedPrice({ price: 100 })).toBe(100);
  });

  it('discountedPrice aplica el porcentaje de descuento', () => {
    expect(discountedPrice({ price: 200, discount: 25 })).toBe(150);
  });

  it('installmentAmount divide el total entre las cuotas', () => {
    expect(installmentAmount(1200, 12)).toBe(100);
    expect(installmentAmount(50, 0)).toBe(50);
  });
});
