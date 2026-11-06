import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldError } from '@shared/components/field-error/field-error';
import type { ClaimForm } from '../../data/claim-form';
import { CLAIM_MESSAGES, MIN_DETAIL_LENGTH } from '../../data/claim-form';

/** Sección: descripción del problema y solución solicitada. */
@Component({
  selector: 'app-claim-detail-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FieldError],
  templateUrl: './claim-detail-section.html',
  styleUrl: './claim-detail-section.scss',
})
export class ClaimDetailSection {
  readonly form = input.required<ClaimForm>();
  protected readonly messages = CLAIM_MESSAGES['detalle'];
  protected readonly minLength = MIN_DETAIL_LENGTH;
}
