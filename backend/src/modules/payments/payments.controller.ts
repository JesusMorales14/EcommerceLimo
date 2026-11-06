import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Pagos')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  /** Crea un PaymentIntent en Stripe y devuelve el `clientSecret` al frontend. */
  @Auth()
  @Post('create-intent')
  createIntent(@Body() { amount }: CreatePaymentIntentDto) {
    return this.payments.createPaymentIntent(amount);
  }

  /** Recibe eventos de Stripe (requiere el cuerpo crudo para verificar la firma). */
  @ApiExcludeEndpoint()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.payments.handleWebhook(req.rawBody, signature);
  }
}
