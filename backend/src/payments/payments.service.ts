import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2026-04-22.dahlia',
  });

  async createPaymentIntent(amount: number): Promise<{ clientSecret: string }> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    return { clientSecret: intent.client_secret! };
  }

  handleWebhook(rawBody: Buffer, signature: string): { received: boolean } {
    const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
    let event: ReturnType<typeof this.stripe.webhooks.constructEvent>;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException('Firma de webhook inválida');
    }

    const obj = event.data.object as any;

    switch (event.type) {
      case 'payment_intent.succeeded':
        this.logger.log(`Pago exitoso: ${obj.id} — $${obj.amount / 100}`);
        break;
      case 'payment_intent.payment_failed':
        this.logger.warn(`Pago fallido: ${obj.id} — ${obj.last_payment_error?.message}`);
        break;
      default:
        this.logger.debug(`Evento no manejado: ${event.type}`);
    }

    return { received: true };
  }
}
