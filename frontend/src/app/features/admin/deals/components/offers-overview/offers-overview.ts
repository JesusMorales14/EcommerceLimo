import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '@core/models/product.model';
import { Pagination } from '@shared/components/pagination/pagination';
import { CurrencyPenPipe } from '@shared/pipes';
import { createClientPagination } from '@shared/utils/pagination';

const PAGE_SIZE = 6;

/** Resumen paginado de los productos marcados como oferta. */
@Component({
  selector: 'app-offers-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPenPipe, Pagination],
  templateUrl: './offers-overview.html',
  styleUrl: './offers-overview.scss',
})
export class OffersOverview {
  readonly offers = input.required<readonly Product[]>();
  protected readonly pager = createClientPagination(this.offers, PAGE_SIZE);
}
