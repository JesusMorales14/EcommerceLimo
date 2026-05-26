import { CurrencyPenPipe } from './currency-pen.pipe';

describe('CurrencyPenPipe', () => {
  const pipe = new CurrencyPenPipe();

  it('formatea un número entero en soles peruanos', () => {
    expect(pipe.transform(1500)).toContain('1');
    expect(pipe.transform(1500)).toContain('500');
  });

  it('retorna "S/ 0" para null', () => {
    expect(pipe.transform(null)).toBe('S/ 0');
  });

  it('retorna "S/ 0" para undefined', () => {
    expect(pipe.transform(undefined)).toBe('S/ 0');
  });

  it('retorna "S/ 0" para el valor 0', () => {
    expect(pipe.transform(0)).toContain('0');
  });

  it('no incluye decimales', () => {
    const result = pipe.transform(99.99);
    expect(result).not.toContain('99.99');
    expect(result).not.toContain(',99');
  });
});
