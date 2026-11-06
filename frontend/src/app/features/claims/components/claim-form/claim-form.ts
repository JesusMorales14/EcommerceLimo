import type { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { Reclamacion } from '@core/models/reclamacion.model';
import { ReclamacionService } from '@core/services/reclamacion.service';
import { FieldError } from '@shared/components/field-error/field-error';
import { extractErrorMessage } from '@shared/utils/http-error';
import { buildClaimForm, CLAIM_MESSAGES, toClaimPayload } from '../../data/claim-form';
import { ClaimDetailSection } from '../claim-detail-section/claim-detail-section';
import { ClaimTypeSection } from '../claim-type-section/claim-type-section';
import { ClaimedItemSection } from '../claimed-item-section/claimed-item-section';
import { ConsumerDataSection } from '../consumer-data-section/consumer-data-section';

const SUBMIT_ERROR = 'Ocurrió un error al enviar tu reclamación. Inténtalo nuevamente.';
const OFFLINE_ERROR = 'No se pudo conectar con el servidor. Inténtalo nuevamente en unos minutos.';

/** Formulario del Libro de Reclamaciones (Ley N° 29571). */
@Component({
  selector: 'app-claim-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    FieldError,
    ClaimTypeSection,
    ConsumerDataSection,
    ClaimedItemSection,
    ClaimDetailSection,
  ],
  templateUrl: './claim-form.html',
  styleUrl: './claim-form.scss',
})
export class ClaimFormComponent {
  private readonly claims = inject(ReclamacionService);
  readonly submitted = output<Reclamacion>();

  protected readonly form = buildClaimForm(inject(FormBuilder));
  protected readonly acceptMessages = CLAIM_MESSAGES['acepta'];
  protected readonly submitting = signal(false);
  protected readonly error = signal('');

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set('');
    this.claims.create(toClaimPayload(this.form)).subscribe({
      next: (claim) => {
        this.submitting.set(false);
        this.submitted.emit(claim);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractErrorMessage(err, SUBMIT_ERROR, OFFLINE_ERROR));
        this.submitting.set(false);
      },
    });
  }
}
