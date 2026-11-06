import { cardBrandLabel, detectCardBrand, formatCardNumber, formatExpiry, maskCardNumber } from './card.utils';

describe('card.utils', () => {
  it('formatCardNumber agrupa en bloques de 4 y descarta caracteres no numéricos', () => {
    expect(formatCardNumber('4111a1111 1111-11112222')).toBe('4111 1111 1111 1111');
  });

  it('formatExpiry inserta la barra después del mes', () => {
    expect(formatExpiry('1')).toBe('1');
    expect(formatExpiry('1227')).toBe('12/27');
    expect(formatExpiry('12/279')).toBe('12/27');
  });

  it.each([
    ['4111', 'visa'],
    ['5212', 'mastercard'],
    ['3712', 'amex'],
    ['6011', ''],
  ])('detectCardBrand(%s) → %s', (input, brand) => {
    expect(detectCardBrand(input)).toBe(brand);
  });

  it('cardBrandLabel usa CARD cuando la marca es desconocida', () => {
    expect(cardBrandLabel('visa')).toBe('VISA');
    expect(cardBrandLabel('')).toBe('CARD');
  });

  it('maskCardNumber completa los dígitos faltantes', () => {
    expect(maskCardNumber('4111')).toBe('4111 •••• •••• ••••');
  });
});
