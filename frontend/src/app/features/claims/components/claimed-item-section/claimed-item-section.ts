import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { ClaimForm } from '../../data/claim-form';

/** Sección: identificación del bien contratado (producto o servicio). */
@Component({
  selector: 'app-claimed-item-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './claimed-item-section.html',
  styleUrl: './claimed-item-section.scss',
})
export class ClaimedItemSection {
  readonly form = input.required<ClaimForm>();
}
