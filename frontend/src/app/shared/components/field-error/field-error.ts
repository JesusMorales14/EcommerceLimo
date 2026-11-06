import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import type { AbstractControl } from '@angular/forms';
import { merge, switchMap } from 'rxjs';

/** Mensajes por clave de error del validador (`required`, `email`, `pattern`…). */
export type ValidationMessages = Readonly<Record<string, string>>;

/**
 * Muestra el primer mensaje de error de un control reactivo una vez que el
 * usuario lo ha tocado. El estilo lo define el padre (`.field-msg`).
 */
@Component({
  selector: 'app-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message()) {
      <span class="field-msg" role="alert">{{ message() }}</span>
    }
  `,
  styles: ':host { display: contents; }',
})
export class FieldError {
  readonly control = input.required<AbstractControl>();
  readonly messages = input.required<ValidationMessages>();

  /** Se incrementa con cada cambio de estado para recalcular el mensaje. */
  private readonly version = signal(0);

  protected readonly message = computed(() => {
    this.version();
    const control = this.control();
    if (!control.touched || !control.errors) return '';
    const key = Object.keys(control.errors).find((errorKey) => this.messages()[errorKey]);
    return key ? this.messages()[key] : '';
  });

  constructor() {
    toObservable(this.control)
      .pipe(
        switchMap((control) => merge(control.statusChanges, control.events)),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.version.update((v) => v + 1));
  }
}
