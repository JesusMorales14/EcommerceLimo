import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FaqItem } from '../../components/faq-item/faq-item';
import type { FaqCategoryId } from '../../data/faqs';
import { FAQ_CATEGORIES, FAQS } from '../../data/faqs';

/** Centro de ayuda con preguntas frecuentes filtrables por categoría. */
@Component({
  selector: 'app-centro-ayuda',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FaqItem],
  templateUrl: './centro-ayuda.html',
  styleUrl: './centro-ayuda.scss',
})
export class CentroAyudaPage {
  protected readonly categories = FAQ_CATEGORIES;
  readonly activeCategory = signal<FaqCategoryId>('todos');
  readonly openFaqIds = signal<ReadonlySet<number>>(new Set());

  readonly filteredFaqs = computed(() => {
    const category = this.activeCategory();
    return category === 'todos' ? FAQS : FAQS.filter((faq) => faq.category === category);
  });

  setCategory(id: FaqCategoryId): void {
    this.activeCategory.set(id);
  }

  toggle(id: number): void {
    this.openFaqIds.update((ids) => {
      const next = new Set(ids);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }
}
