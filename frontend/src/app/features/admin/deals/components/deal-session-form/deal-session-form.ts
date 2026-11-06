import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DealSessionService } from '@core/services/deal-session.service';

/** Valor mínimo para un `<input type="datetime-local">` (ahora, en hora local). */
function nowAsLocalInput(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

/** Valida el rango de fechas. Devuelve el mensaje de error o `null`. */
export function validateDealRange(endsAt: Date | null, startsAt?: Date): string | null {
  if (!endsAt) return 'Selecciona una fecha y hora de fin.';
  if (endsAt <= new Date()) return 'La fecha de fin debe ser futura.';
  if (startsAt && startsAt >= endsAt) return 'La fecha de inicio debe ser anterior a la de fin.';
  return null;
}

/** Formulario para activar o programar una sesión de "Ofertas del Día". */
@Component({
  selector: 'app-deal-session-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './deal-session-form.html',
  styleUrl: './deal-session-form.scss',
})
export class DealSessionForm {
  /** Si hay una sesión activa, el formulario la reemplaza. */
  readonly replacing = input(false);
  readonly activated = output<void>();

  private readonly deals = inject(DealSessionService);

  protected readonly startsAt = signal('');
  protected readonly endsAt = signal('');
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly minDatetime = nowAsLocalInput();

  protected activate(): void {
    const endsAt = this.endsAt() ? new Date(this.endsAt()) : null;
    const startsAt = this.startsAt() ? new Date(this.startsAt()) : undefined;
    const validationError = validateDealRange(endsAt, startsAt);
    this.success.set('');
    this.error.set(validationError ?? '');
    if (validationError || !endsAt) return;

    this.saving.set(true);
    this.deals.create(endsAt, startsAt).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set('¡Oferta activada!');
        this.startsAt.set('');
        this.endsAt.set('');
        this.activated.emit();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Error al activar la oferta.');
      },
    });
  }
}
