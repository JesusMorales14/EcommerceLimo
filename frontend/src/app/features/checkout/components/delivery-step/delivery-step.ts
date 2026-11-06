import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CheckoutStore } from '../../data/checkout.store';
import type { GeoPoint } from '../../services/geocoding.service';
import { GeocodingService } from '../../services/geocoding.service';
import { DeliveryMap } from '../delivery-map/delivery-map';

/** Paso 1: datos y ubicación de entrega. */
@Component({
  selector: 'app-delivery-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, DeliveryMap],
  templateUrl: './delivery-step.html',
  styleUrl: './delivery-step.scss',
})
export class DeliveryStep {
  protected readonly store = inject(CheckoutStore);
  private readonly geocoding = inject(GeocodingService);
  private readonly map = viewChild(DeliveryMap);

  protected readonly addressQuery = signal('');
  protected readonly searching = signal(false);

  protected searchAddress(): void {
    const query = this.addressQuery().trim();
    if (!query) return;
    this.searching.set(true);
    this.geocoding.search(query).subscribe({
      next: (result) => {
        this.searching.set(false);
        if (!result) return;
        this.store.updateDelivery({ address: result.address, lat: result.lat, lng: result.lng });
        this.map()?.focus(result);
      },
      error: () => this.searching.set(false),
    });
  }

  protected onLocationPicked(point: GeoPoint): void {
    this.store.updateDelivery({ lat: point.lat, lng: point.lng });
    this.geocoding.reverse(point).subscribe((address) => {
      if (address) this.store.updateDelivery({ address });
    });
  }
}
