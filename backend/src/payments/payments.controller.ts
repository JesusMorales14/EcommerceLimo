import { Body, Controller, Headers, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  /** Crea un PaymentIntent en Stripe y devuelve el clientSecret al frontend */
  @UseGuards(JwtGuard)
  @Post('create-intent')
  createIntent(@Body('amount') amount: number) {
    return this.payments.createPaymentIntent(amount);
  }

  /** Recibe eventos de Stripe (requiere rawBody para verificar la firma) */
  @Post('webhook')
  @HttpCode(200)
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.payments.handleWebhook(req.rawBody!, sig);
  }
}
