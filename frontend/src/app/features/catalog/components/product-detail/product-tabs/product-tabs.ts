import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ProductDetailStore } from '../../../data/product-detail.store';
import { ProductReviews } from '../product-reviews/product-reviews';
import { ProductSpecs } from '../product-specs/product-specs';

type TabId = 'description' | 'specs' | 'reviews';

/** Pestañas accesibles (patrón WAI-ARIA Tabs) con descripción, especificaciones y opiniones. */
@Component({
  selector: 'app-product-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductSpecs, ProductReviews],
  templateUrl: './product-tabs.html',
  styleUrl: './product-tabs.scss',
})
export class ProductTabs {
  protected readonly store = inject(ProductDetailStore);
  protected readonly activeTab = signal<TabId>('description');
  protected readonly tabs = computed<readonly { id: TabId; label: string }[]>(() => [
    { id: 'description', label: 'Descripción' },
    { id: 'specs', label: 'Especificaciones' },
    { id: 'reviews', label: `Opiniones (${this.store.reviewCount()})` },
  ]);

  /** Navegación con flechas entre pestañas. */
  protected onKeydown(event: KeyboardEvent, index: number): void {
    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!offset) return;
    const tabs = this.tabs();
    const next = tabs[(index + offset + tabs.length) % tabs.length];
    this.activeTab.set(next.id);
    (event.currentTarget as HTMLElement).parentElement
      ?.querySelector<HTMLElement>(`#tab-${next.id}`)
      ?.focus();
  }
}
