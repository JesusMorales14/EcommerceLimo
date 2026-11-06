import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ReclamacionEstado } from '@core/models/reclamacion.model';
import { isReclamacionStepDone, RECLAMACION_TIMELINE } from '@core/models/reclamacion.model';

/** Línea de tiempo del estado de una reclamación. */
@Component({
  selector: 'app-claim-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './claim-timeline.html',
  styleUrl: './claim-timeline.scss',
})
export class ClaimTimeline {
  readonly status = input.required<ReclamacionEstado>();

  protected readonly steps = RECLAMACION_TIMELINE;
  protected readonly isDone = isReclamacionStepDone;
}
