import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import type { ReclamacionCounts, ReclamacionFilter } from '@core/models/reclamacion.model';

/** Pestañas para filtrar reclamaciones por estado. */
@Component({
  selector: 'app-claims-filter-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './claims-filter-tabs.html',
  styleUrl: './claims-filter-tabs.scss',
})
export class ClaimsFilterTabs {
  readonly counts = input.required<ReclamacionCounts>();
  readonly selected = model<ReclamacionFilter>('TODOS');

  protected readonly filters: readonly { value: ReclamacionFilter; label: string }[] = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_REVISION', label: 'En revisión' },
    { value: 'RESUELTO', label: 'Resuelto' },
    { value: 'CERRADO', label: 'Cerrado' },
  ];
}
