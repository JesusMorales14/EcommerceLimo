import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ReclamacionService } from '@core/services/reclamacion.service';
import { ClaimCard } from '../../components/claim-card/claim-card';

/** Seguimiento de las reclamaciones del cliente autenticado. */
@Component({
  selector: 'app-mis-reclamaciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ClaimCard],
  templateUrl: './mis-reclamaciones.html',
  styleUrl: './mis-reclamaciones.scss',
})
export class MisReclamacionesPage {
  private readonly service = inject(ReclamacionService);

  protected readonly claimsResource = rxResource({ stream: () => this.service.getMine() });
  protected readonly claims = computed(() => (this.claimsResource.hasValue() ? this.claimsResource.value() : []));
  protected readonly expandedId = signal<number | null>(null);

  protected toggle(id: number): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }
}
