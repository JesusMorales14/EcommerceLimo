import type { CardBrand } from './checkout.models';

export const CARD_NUMBER_LENGTH = 16;
const GROUP_SIZE = 4;
const MASK_CHAR = '•';

const BRAND_PATTERNS: readonly [CardBrand, RegExp][] = [
  ['visa', /^4/],
  ['mastercard', /^5[1-5]/],
  ['amex', /^3[47]/],
];

const BRAND_LABELS: Record<Exclude<CardBrand, ''>, string> = {
  visa: 'VISA',
  mastercard: 'MASTERCARD',
  amex: 'AMEX',
};

const onlyDigits = (value: string) => value.replace(/\D/g, '');

/** Normaliza el número: solo dígitos, máximo 16, agrupados de 4 en 4. */
export function formatCardNumber(value: string): string {
  return onlyDigits(value)
    .slice(0, CARD_NUMBER_LENGTH)
    .replace(new RegExp(`(.{${GROUP_SIZE}})`, 'g'), '$1 ')
    .trim();
}

/** Normaliza la fecha de vencimiento al formato MM/AA. */
export function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function detectCardBrand(value: string): CardBrand {
  const digits = onlyDigits(value);
  return BRAND_PATTERNS.find(([, pattern]) => pattern.test(digits))?.[0] ?? '';
}

export function cardBrandLabel(brand: CardBrand): string {
  return brand ? BRAND_LABELS[brand] : 'CARD';
}

/** Número para la vista previa: completa con • los dígitos faltantes. */
export function maskCardNumber(value: string): string {
  const padded = onlyDigits(value).padEnd(CARD_NUMBER_LENGTH, MASK_CHAR);
  return padded.replace(new RegExp(`(.{${GROUP_SIZE}})`, 'g'), '$1 ').trim();
}

export function cardDigitsCount(value: string): number {
  return onlyDigits(value).length;
}
