import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { buildPageWindow } from '@shared/utils/pagination';

/** Control de paginación accesible con elipsis. */
@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly label = input('Paginación');
  readonly pageChange = output<number>();

  protected readonly tokens = computed(() => buildPageWindow(this.page(), this.totalPages()));

  protected goTo(page: number): void {
    if (page !== this.page() && page >= 1 && page <= this.totalPages()) this.pageChange.emit(page);
  }
}
