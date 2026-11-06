import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Reclamacion } from '@core/models/reclamacion.model';
import { BIEN_LABELS, TIPO_LABELS } from '@core/models/reclamacion.model';

/** Datos del consumidor y detalle de una reclamación (solo lectura). */
@Component({
  selector: 'app-claim-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './claim-details.html',
  styleUrl: './claim-details.scss',
})
export class ClaimDetails {
  readonly claim = input.required<Reclamacion>();
  protected readonly tipoLabels = TIPO_LABELS;
  protected readonly bienLabels = BIEN_LABELS;
}
