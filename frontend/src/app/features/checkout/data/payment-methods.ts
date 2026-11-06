import type { PaymentMethod, PaymentMethodId } from './checkout.models';

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  { id: 'card', label: 'Tarjeta crédito/débito', icon: 'credit_card', description: 'Visa, Mastercard, American Express' },
  { id: 'paypal', label: 'PayPal', icon: 'account_balance_wallet', description: 'Paga con tu cuenta PayPal de forma segura' },
  { id: 'mercadopago', label: 'Mercado Pago', icon: 'payments', description: 'Todas las tarjetas, cuotas sin interés' },
  { id: 'cash', label: 'Efectivo al recibir', icon: 'local_shipping', description: 'Paga en efectivo cuando llegue tu pedido' },
];

export function findPaymentMethod(id: PaymentMethodId): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((method) => method.id === id);
}
