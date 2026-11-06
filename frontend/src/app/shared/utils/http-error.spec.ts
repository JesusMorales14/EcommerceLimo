import { extractErrorMessage } from './http-error';

describe('extractErrorMessage', () => {
  it('usa el mensaje de conexión cuando el estado es 0', () => {
    expect(extractErrorMessage({ status: 0, error: null }, 'x', 'offline')).toBe('offline');
  });

  it('devuelve el mensaje del backend', () => {
    expect(extractErrorMessage({ status: 400, error: { message: 'Cupón agotado' } }, 'x')).toBe('Cupón agotado');
  });

  it('une los mensajes de validación', () => {
    expect(extractErrorMessage({ status: 400, error: { message: ['a', 'b'] } }, 'x')).toBe('a. b');
  });

  it('usa el fallback si no hay mensaje', () => {
    expect(extractErrorMessage({ status: 500, error: {} }, 'fallback')).toBe('fallback');
  });
});
