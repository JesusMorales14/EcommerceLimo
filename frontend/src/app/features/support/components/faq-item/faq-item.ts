import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Faq } from '../../data/faqs';

/** Pregunta frecuente desplegable (patrón WAI-ARIA Accordion). */
@Component({
  selector: 'app-faq-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './faq-item.html',
  styleUrl: './faq-item.scss',
})
export class FaqItem {
  readonly faq = input.required<Faq>();
  readonly open = input(false);
  readonly toggled = output<number>();
}
