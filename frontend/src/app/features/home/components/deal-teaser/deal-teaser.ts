import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { DealSession } from '@core/services/deal-session.service';
import { toTimeParts } from '@shared/utils/countdown';

/** Aviso de próximas ofertas con cuenta regresiva hasta su inicio. */
@Component({
  selector: 'app-deal-teaser',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './deal-teaser.html',
  styleUrl: './deal-teaser.scss',
})
export class DealTeaser {
  readonly session = input.required<DealSession>();
  /** Milisegundos restantes para el inicio. */
  readonly remainingMs = input.required<number>();

  protected readonly time = computed(() => toTimeParts(this.remainingMs()));
}
