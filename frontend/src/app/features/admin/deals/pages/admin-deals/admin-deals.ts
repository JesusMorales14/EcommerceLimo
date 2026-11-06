import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ConfirmService } from '@core/services/confirm.service';
import { DealSessionService } from '@core/services/deal-session.service';
import { ProductService } from '@core/services/product.service';
import { createCountdown } from '@shared/utils/countdown';
import { DealSessionForm } from '../../components/deal-session-form/deal-session-form';
import { DealStatusCard } from '../../components/deal-status-card/deal-status-card';
import { OffersOverview } from '../../components/offers-overview/offers-overview';

const toDate = (iso?: string) => (iso ? new Date(iso) : null);

/** Configuración de las "Ofertas del Día" del inicio. */
@Component({
  selector: 'app-admin-deals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DealStatusCard, DealSessionForm, OffersOverview],
  templateUrl: './admin-deals.html',
  styleUrl: './admin-deals.scss',
})
export class AdminDealsPage {
  private readonly deals = inject(DealSessionService);
  private readonly products = inject(ProductService);
  private readonly confirmService = inject(ConfirmService);

  protected readonly activeResource = rxResource({ stream: () => this.deals.getActive() });
  protected readonly scheduledResource = rxResource({ stream: () => this.deals.getScheduled() });
  private readonly offersResource = rxResource({ stream: () => this.products.getOffers() });

  protected readonly active = computed(() => (this.activeResource.hasValue() ? this.activeResource.value() : null));
  protected readonly scheduled = computed(() =>
    this.scheduledResource.hasValue() ? this.scheduledResource.value() : null,
  );
  protected readonly offers = computed(() => (this.offersResource.hasValue() ? this.offersResource.value().items : []));

  protected readonly remaining = createCountdown(computed(() => toDate(this.active()?.endsAt)));
  protected readonly untilStart = createCountdown(computed(() => toDate(this.scheduled()?.startsAt)));

  protected reload(): void {
    this.activeResource.reload();
    this.scheduledResource.reload();
  }

  protected cancel(): void {
    const message = this.active() ? '¿Cancelar la oferta activa?' : '¿Cancelar la sesión programada?';
    if (!this.confirmService.confirm(message)) return;
    this.deals.cancel().subscribe(() => {
      this.activeResource.set(null);
      this.scheduledResource.set(null);
    });
  }
}
