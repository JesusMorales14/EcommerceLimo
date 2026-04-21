import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  });

  // 🔥 CREAR INTENT DE PAGO
  async createPaymentIntent(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    // 🚨 FIX CRÍTICO
    if (!order) {
      throw new BadRequestException('Orden no existe');
    }

    return this.stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: 'pen',
      payment_method_types: ['card'],
      metadata: {
        orderId: order.id.toString(), // 🔥 clave webhook
      },
    });
  }

  // 🔥 WEBHOOK STRIPE
  async handleWebhook(req: any, signature: string) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook error: ${err.message}`);
    }

    // 🔥 evento pago exitoso
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;

      const orderId = Number(paymentIntent.metadata?.orderId);

      if (!orderId) return { received: true };

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
        },
      });
    }

    return { received: true };
  }
}
