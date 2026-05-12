import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

declare const Stripe: any;

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private api = inject(ApiService);
  private _stripe: any = null;

  getStripe() {
    if (!this._stripe && typeof Stripe !== 'undefined') {
      this._stripe = Stripe(environment.stripePublicKey);
    }
    return this._stripe;
  }

  createIntent(amount: number) {
    return this.api.post<{ clientSecret: string }>('/payments/create-intent', { amount });
  }
}
