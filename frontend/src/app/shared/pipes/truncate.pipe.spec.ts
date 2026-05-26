import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  const pipe = new TruncatePipe();

  it('no trunca textos más cortos que el límite', () => {
    expect(pipe.transform('Hola mundo', 20)).toBe('Hola mundo');
  });

  it('trunca al límite por defecto (60) y añade "..."', () => {
    const long = 'a'.repeat(80);
    const result = pipe.transform(long);
    expect(result.length).toBeLessThanOrEqual(63);
    expect(result.endsWith('...')).toBe(true);
  });

  it('respeta un límite personalizado', () => {
    const result = pipe.transform('Texto de prueba', 5);
    expect(result).toBe('Texto...');
  });

  it('respeta un sufijo personalizado', () => {
    const result = pipe.transform('Texto de prueba', 5, ' →');
    expect(result.endsWith(' →')).toBe(true);
  });

  it('retorna "" para null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('retorna "" para undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('retorna "" para cadena vacía', () => {
    expect(pipe.transform('')).toBe('');
  });
});
