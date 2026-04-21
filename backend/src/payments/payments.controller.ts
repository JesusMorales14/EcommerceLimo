import { Controller, Post, Body, Req, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  create(@Body() body: { orderId: number }) {
    return this.paymentsService.createPaymentIntent(body.orderId);
  }

  @Post('webhook')
  handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(req, signature);
  }
}
