import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Order } from '@core/models/order.model';
import { Pagination } from '@shared/components/pagination/pagination';
import { CurrencyPenPipe, OrderStatusPipe } from '@shared/pipes';
import { createClientPagination } from '@shared/utils/pagination';

const PAGE_SIZE = 3;

/** Tabla compacta con los pedidos más recientes. */
@Component({
  selector: 'app-recent-orders-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, CurrencyPenPipe, OrderStatusPipe, Pagination],
  templateUrl: './recent-orders-table.html',
  styleUrl: './recent-orders-table.scss',
})
export class RecentOrdersTable {
  readonly orders = input.required<readonly Order[]>();
  protected readonly pager = createClientPagination(this.orders, PAGE_SIZE);
}
