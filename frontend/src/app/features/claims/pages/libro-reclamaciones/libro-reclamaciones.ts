import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { Reclamacion } from '@core/models/reclamacion.model';
import { ClaimFormComponent } from '../../components/claim-form/claim-form';
import { ClaimSuccessCard } from '../../components/claim-success-card/claim-success-card';

/** Libro de Reclamaciones virtual. */
@Component({
  selector: 'app-libro-reclamaciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClaimFormComponent, ClaimSuccessCard],
  templateUrl: './libro-reclamaciones.html',
  styleUrl: './libro-reclamaciones.scss',
})
export class LibroReclamacionesPage {
  protected readonly registeredClaim = signal<Reclamacion | null>(null);
}
