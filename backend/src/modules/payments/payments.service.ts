import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { APP_CONFIG } from '../../config/app-config.token';
import type { AppConfig } from '../../config/configuration';

type StripeClient = InstanceType<typeof Stripe>;
type StripeEvent = ReturnType<StripeClient['webhooks']['constructEvent']>;

const CURRENCY = 'pen';
const CENTS = 100;

/** Adaptador sobre la API de Stripe (intenciones de pago y webhooks). */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: StripeClient | null;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    this.stripe = config.stripe.secretKey
      ? new Stripe(config.stripe.secretKey)
      : null;
  }

  async createPaymentIntent(amount: number): Promise<{ clientSecret: string }> {
    const intent = await this.client().paymentIntents.create({
      amount: Math.round(amount * CENTS),
      currency: CURRENCY,
      automatic_payment_methods: { enabled: true },
    });
    if (!intent.client_secret)
      throw new ServiceUnavailableException(
        'Stripe no devolvió el client secret',
      );
    return { clientSecret: intent.client_secret };
  }

  handleWebhook(
    rawBody: Buffer | undefined,
    signature: string,
  ): { received: true } {
    if (!rawBody) throw new BadRequestException('Cuerpo del webhook vacío');
    let event: StripeEvent;
    try {
      event = this.client().webhooks.constructEvent(
        rawBody,
        signature,
        this.config.stripe.webhookSecret ?? '',
      );
    } catch {
      throw new BadRequestException('Firma de webhook inválida');
    }
    this.logEvent(event);
    return { received: true };
  }

  private logEvent(event: StripeEvent): void {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      this.logger.log(
        `Pago exitoso: ${intent.id} — S/ ${intent.amount / CENTS}`,
      );
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      this.logger.warn(
        `Pago fallido: ${intent.id} — ${intent.last_payment_error?.message ?? 'sin detalle'}`,
      );
    } else {
      this.logger.debug(`Evento no manejado: ${event.type}`);
    }
  }

  private client(): StripeClient {
    if (!this.stripe)
      throw new ServiceUnavailableException('Pasarela de pagos no configurada');
    return this.stripe;
  }
}
