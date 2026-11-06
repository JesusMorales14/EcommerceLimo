import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Reclamacion, ReclamacionEstado } from '@core/models/reclamacion.model';
import { ESTADO_LABELS, ESTADO_ORDER } from '@core/models/reclamacion.model';

export interface ClaimResponse {
  readonly estado: ReclamacionEstado;
  readonly respuesta: string;
}

/** Formulario del administrador para cambiar el estado y responder. */
@Component({
  selector: 'app-claim-response-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './claim-response-form.html',
  styleUrl: './claim-response-form.scss',
})
export class ClaimResponseForm {
  readonly claim = input.required<Reclamacion>();
  readonly saving = input(false);
  readonly error = input('');
  readonly saved = output<ClaimResponse>();

  protected readonly estado = linkedSignal(() => this.claim().estado);
  protected readonly respuesta = linkedSignal(() => this.claim().respuesta ?? '');
  protected readonly estadoOptions = ESTADO_ORDER;
  protected readonly estadoLabels = ESTADO_LABELS;

  protected submit(): void {
    this.saved.emit({ estado: this.estado(), respuesta: this.respuesta() });
  }
}
