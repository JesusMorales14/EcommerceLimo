import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Reclamacion } from '@core/models/reclamacion.model';
import { ESTADO_COLORS, ESTADO_LABELS, TIPO_COLORS, TIPO_LABELS } from '@core/models/reclamacion.model';
import { StatusBadge } from '@shared/components/status-badge/status-badge';
import { ClaimDetails } from '../claim-details/claim-details';
import type { ClaimResponse } from '../claim-response-form/claim-response-form';
import { ClaimResponseForm } from '../claim-response-form/claim-response-form';

/** Fila expandible de una reclamación en el panel de administración. */
@Component({
  selector: 'app-admin-claim-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, StatusBadge, ClaimDetails, ClaimResponseForm],
  templateUrl: './admin-claim-card.html',
  styleUrl: './admin-claim-card.scss',
})
export class AdminClaimCard {
  readonly claim = input.required<Reclamacion>();
  readonly expanded = input(false);
  readonly saving = input(false);
  readonly error = input('');
  readonly toggled = output<number>();
  readonly saved = output<ClaimResponse>();

  protected readonly estadoLabels = ESTADO_LABELS;
  protected readonly estadoColors = ESTADO_COLORS;
  protected readonly tipoLabels = TIPO_LABELS;
  protected readonly tipoColors = TIPO_COLORS;
}
