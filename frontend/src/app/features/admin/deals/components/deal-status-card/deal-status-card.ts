import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { DealSession } from '@core/services/deal-session.service';
import { formatDuration } from '@shared/utils/countdown';

/** Estado actual de la sesión de ofertas: activa, programada o inexistente. */
@Component({
  selector: 'app-deal-status-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './deal-status-card.html',
  styleUrl: './deal-status-card.scss',
})
export class DealStatusCard {
  readonly active = input<DealSession | null>(null);
  readonly scheduled = input<DealSession | null>(null);
  /** Milisegundos para que termine la sesión activa. */
  readonly remainingMs = input(0);
  /** Milisegundos para que empiece la sesión programada. */
  readonly untilStartMs = input(0);
  readonly cancelled = output<void>();

  protected readonly remaining = computed(() => (this.remainingMs() > 0 ? formatDuration(this.remainingMs()) : 'Expirada'));
  protected readonly untilStart = computed(() =>
    this.untilStartMs() > 0 ? formatDuration(this.untilStartMs()) : '¡Ahora!',
  );
}
