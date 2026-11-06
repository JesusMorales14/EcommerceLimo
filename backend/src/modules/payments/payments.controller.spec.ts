import { PaymentsController } from './payments.controller';
import type { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  const service = { createPaymentIntent: jest.fn(), handleWebhook: jest.fn() };
  const controller = new PaymentsController(
    service as unknown as PaymentsService,
  );

  it('delega la creación del intent y el webhook', () => {
    controller.createIntent({ amount: 50 });
    const raw = Buffer.from('{}');
    controller.webhook({ rawBody: raw } as never, 'sig');
    expect(service.createPaymentIntent).toHaveBeenCalledWith(50);
    expect(service.handleWebhook).toHaveBeenCalledWith(raw, 'sig');
  });
});
