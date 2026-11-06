import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Sufijo hexadecimal de opacidad (~12%) para el fondo de la etiqueta. */
const BACKGROUND_ALPHA = '20';

/**
 * Etiqueta de estado coloreada (pedidos, reclamaciones…). La forma y el tamaño
 * los aporta el padre mediante una clase sobre `<app-status-badge>`.
 */
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '{{ label() }}',
  host: {
    '[style.color]': 'color()',
    '[style.background]': 'background()',
  },
  styles: ':host { display: inline-block; }',
})
export class StatusBadge {
  readonly label = input.required<string>();
  /** Color hexadecimal (#rrggbb). */
  readonly color = input.required<string>();

  protected readonly background = computed(() => this.color() + BACKGROUND_ALPHA);
}
