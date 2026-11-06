import type { ElementRef } from '@angular/core';
import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { SearchService } from '@core/services/search.service';
import { SearchResultCard } from '../search-result-card/search-result-card';

/** Modal con los resultados de búsqueda agrupados por marca y por nombre de producto. */
@Component({
  selector: 'app-search-results-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchResultCard],
  templateUrl: './search-results-modal.html',
  styleUrl: './search-results-modal.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class SearchResultsModal {
  protected readonly search = inject(SearchService);
  protected readonly searchInput = signal(this.search.query());
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('searchField');

  constructor() {
    afterNextRender(() => this.input()?.nativeElement.focus());
  }

  protected onInput(event: Event): void {
    this.searchInput.set((event.target as HTMLInputElement).value);
  }

  protected searchAgain(event: Event): void {
    event.preventDefault();
    const query = this.searchInput().trim();
    if (query) this.search.open(query);
  }

  protected openProduct(productId: number): void {
    this.search.navigateTo(productId);
  }

  protected onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  protected close(): void {
    this.search.close();
  }
}
