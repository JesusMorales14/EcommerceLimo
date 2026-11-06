import { CARD_NUMBER_LENGTH, cardDigitsCount } from './card.utils';
import type { CardData, DeliveryInfo } from './checkout.models';

const EXPIRY_PATTERN = /^\d{2}\/\d{2}$/;
const MIN_CVV_LENGTH = 3;

/** Devuelve un mensaje de error o `null` si los datos de entrega son válidos. */
export function validateDelivery(delivery: DeliveryInfo): string | null {
  if (!delivery.name.trim() || !delivery.phone.trim() || !delivery.address.trim()) {
    return 'Completa nombre, teléfono y dirección de entrega.';
  }
  return null;
}

/** Devuelve un mensaje de error o `null` si los datos de la tarjeta son válidos. */
export function validateCard(card: CardData): string | null {
  if (cardDigitsCount(card.number) !== CARD_NUMBER_LENGTH) {
    return 'Ingresa un número de tarjeta válido (16 dígitos).';
  }
  if (!EXPIRY_PATTERN.test(card.expiry)) return 'Ingresa la fecha de vencimiento (MM/AA).';
  if (card.cvv.length < MIN_CVV_LENGTH) return 'Ingresa el código CVV.';
  if (!card.holder.trim()) return 'Ingresa el nombre del titular.';
  return null;
}
