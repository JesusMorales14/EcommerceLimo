import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Reclamacion } from '@core/models/reclamacion.model';

/** Confirmación de una reclamación registrada. */
@Component({
  selector: 'app-claim-success-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './claim-success-card.html',
  styleUrl: './claim-success-card.scss',
})
export class ClaimSuccessCard {
  readonly claim = input.required<Reclamacion>();
  readonly newClaim = output<void>();
}
