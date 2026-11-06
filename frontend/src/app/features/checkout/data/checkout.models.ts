import type { DeliveryInfo } from '@core/services/order.service';

export type { DeliveryInfo } from '@core/services/order.service';

/** Pasos del asistente de compra. */
export enum CheckoutStep {
  Delivery = 1,
  Payment = 2,
  Confirm = 3,
}

export type PaymentMethodId = 'card' | 'paypal' | 'mercadopago' | 'cash';

export interface PaymentMethod {
  readonly id: PaymentMethodId;
  readonly label: string;
  readonly icon: string;
  readonly description: string;
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | '';

/** Datos de la tarjeta (simulación: nunca se envían al servidor). */
export interface CardData {
  holder: string;
  number: string;
  expiry: string;
  cvv: string;
}

export const EMPTY_DELIVERY: DeliveryInfo = { name: '', phone: '', address: '', notes: '' };
export const EMPTY_CARD: CardData = { holder: '', number: '', expiry: '', cvv: '' };
