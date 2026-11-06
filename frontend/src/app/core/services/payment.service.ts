import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface PaymentIntentResponse {
  clientSecret: string;
}

/**
 * Puerto hacia la pasarela de pagos (Stripe en el backend).
 * El checkout actual simula el cobro; este servicio queda como punto de
 * integración para habilitar pagos reales sin tocar los componentes.
 */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly api = inject(ApiService);

  createIntent(amount: number) {
    return this.api.post<PaymentIntentResponse>('/payments/create-intent', { amount });
  }
}
