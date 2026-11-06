import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { ClaimForm } from '../../data/claim-form';

/** Sección: tipo de reclamación (reclamo o queja). */
@Component({
  selector: 'app-claim-type-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './claim-type-section.html',
  styleUrl: './claim-type-section.scss',
})
export class ClaimTypeSection {
  readonly form = input.required<ClaimForm>();
}
