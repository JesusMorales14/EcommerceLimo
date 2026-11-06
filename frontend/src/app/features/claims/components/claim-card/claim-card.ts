import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Reclamacion } from '@core/models/reclamacion.model';
import { BIEN_LABELS, ESTADO_COLORS, ESTADO_LABELS, TIPO_COLORS, TIPO_LABELS } from '@core/models/reclamacion.model';
import { StatusBadge } from '@shared/components/status-badge/status-badge';
import { ClaimTimeline } from '../claim-timeline/claim-timeline';

/** Tarjeta expandible con el estado y el detalle de una reclamación del cliente. */
@Component({
  selector: 'app-claim-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, StatusBadge, ClaimTimeline],
  templateUrl: './claim-card.html',
  styleUrl: './claim-card.scss',
})
export class ClaimCard {
  readonly claim = input.required<Reclamacion>();
  readonly expanded = input(false);
  readonly toggled = output<number>();

  protected readonly estadoLabels = ESTADO_LABELS;
  protected readonly estadoColors = ESTADO_COLORS;
  protected readonly tipoLabels = TIPO_LABELS;
  protected readonly tipoColors = TIPO_COLORS;
  protected readonly bienLabels = BIEN_LABELS;
}
