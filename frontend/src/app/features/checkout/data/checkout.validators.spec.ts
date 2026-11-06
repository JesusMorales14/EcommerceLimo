import { validateCard, validateDelivery } from './checkout.validators';

const VALID_CARD = { holder: 'Ana Pérez', number: '4111 1111 1111 1111', expiry: '12/30', cvv: '123' };

describe('checkout.validators', () => {
  it('validateDelivery exige nombre, teléfono y dirección', () => {
    expect(validateDelivery({ name: 'Ana', phone: '', address: 'Av. 1', notes: '' })).toContain('Completa');
    expect(validateDelivery({ name: 'Ana', phone: '999', address: 'Av. 1', notes: '' })).toBeNull();
  });

  it('validateCard acepta una tarjeta completa', () => {
    expect(validateCard(VALID_CARD)).toBeNull();
  });

  it.each([
    [{ number: '4111' }, 'número de tarjeta'],
    [{ expiry: '1230' }, 'vencimiento'],
    [{ cvv: '1' }, 'CVV'],
    [{ holder: ' ' }, 'titular'],
  ])('validateCard detecta datos inválidos %#', (patch, message) => {
    expect(validateCard({ ...VALID_CARD, ...patch })).toContain(message);
  });
});
