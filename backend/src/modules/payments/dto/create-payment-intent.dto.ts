import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

/** Stripe exige un mínimo por transacción; se fija un máximo razonable por seguridad. */
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100_000;

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 149.9, description: 'Monto en soles (PEN)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(MIN_AMOUNT)
  @Max(MAX_AMOUNT)
  amount!: number;
}
