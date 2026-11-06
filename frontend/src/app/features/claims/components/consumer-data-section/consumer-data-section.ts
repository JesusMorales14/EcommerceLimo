import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldError } from '@shared/components/field-error/field-error';
import type { ClaimForm } from '../../data/claim-form';
import { CLAIM_MESSAGES } from '../../data/claim-form';

/** Sección: datos personales del consumidor. */
@Component({
  selector: 'app-consumer-data-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FieldError],
  templateUrl: './consumer-data-section.html',
  styleUrl: './consumer-data-section.scss',
})
export class ConsumerDataSection {
  readonly form = input.required<ClaimForm>();
  protected readonly messages = CLAIM_MESSAGES;

  protected invalid(name: keyof ClaimForm['controls']): boolean {
    const control = this.form().controls[name];
    return control.touched && control.invalid;
  }
}
