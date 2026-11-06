import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { AppConfig } from '../../config/configuration';
import { PaymentsService } from './payments.service';

const create = jest.fn();
const constructEvent = jest.fn();

jest.mock('stripe', () =>
  jest.fn().mockImplementation(() => ({
    paymentIntents: { create },
    webhooks: { constructEvent },
  })),
);

const config = (secretKey?: string) =>
  ({ stripe: { secretKey, webhookSecret: 'whsec' } }) as AppConfig;

describe('PaymentsService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('falla con 503 si Stripe no está configurado', async () => {
    await expect(
      new PaymentsService(config()).createPaymentIntent(10),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('crea el PaymentIntent en céntimos de PEN', async () => {
    create.mockResolvedValue({ client_secret: 'cs_123' });
    await expect(
      new PaymentsService(config('sk_test')).createPaymentIntent(149.9),
    ).resolves.toEqual({ clientSecret: 'cs_123' });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 14990, currency: 'pen' }),
    );
  });

  it('rechaza webhooks con firma inválida o sin cuerpo', () => {
    const service = new PaymentsService(config('sk_test'));
    expect(() => service.handleWebhook(undefined, 'sig')).toThrow(
      BadRequestException,
    );
    constructEvent.mockImplementation(() => {
      throw new Error('firma');
    });
    expect(() => service.handleWebhook(Buffer.from('{}'), 'sig')).toThrow(
      'Firma de webhook inválida',
    );
  });

  it.each([
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'charge.refunded',
  ])('acepta el evento %s', (type) => {
    constructEvent.mockReturnValue({
      type,
      data: { object: { id: 'pi_1', amount: 1000 } },
    });
    const service = new PaymentsService(config('sk_test'));
    jest.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'debug').mockImplementation(() => undefined);
    expect(service.handleWebhook(Buffer.from('{}'), 'sig')).toEqual({
      received: true,
    });
  });
});
