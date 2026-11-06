import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ReclamacionCounts, ReclamacionFilter } from '@core/models/reclamacion.model';

interface StatDefinition {
  readonly key: ReclamacionFilter;
  readonly label: string;
  readonly icon: string;
  readonly variant: string;
}

/** Tarjetas con el resumen de reclamaciones por estado. */
@Component({
  selector: 'app-claims-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './claims-stats.html',
  styleUrl: './claims-stats.scss',
})
export class ClaimsStats {
  readonly counts = input.required<ReclamacionCounts>();

  protected readonly stats: readonly StatDefinition[] = [
    { key: 'TODOS', label: 'Total', icon: 'assignment', variant: 'total' },
    { key: 'PENDIENTE', label: 'Pendientes', icon: 'schedule', variant: 'pending' },
    { key: 'EN_REVISION', label: 'En revisión', icon: 'manage_search', variant: 'review' },
    { key: 'RESUELTO', label: 'Resueltos', icon: 'check_circle', variant: 'resolved' },
  ];
}
