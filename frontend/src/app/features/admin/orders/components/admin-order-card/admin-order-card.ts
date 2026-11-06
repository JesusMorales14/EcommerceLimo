import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Order, OrderStatus } from '@core/models/order.model';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@core/models/order.model';
import { StatusBadge } from '@shared/components/status-badge/status-badge';
import { CurrencyPenPipe } from '@shared/pipes';

export interface OrderStatusChange {
  readonly orderId: number;
  readonly status: OrderStatus;
}

/** Tarjeta de pedido para el administrador, con cambio de estado. */
@Component({
  selector: 'app-admin-order-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, CurrencyPenPipe, StatusBadge],
  templateUrl: './admin-order-card.html',
  styleUrl: './admin-order-card.scss',
})
export class AdminOrderCard {
  readonly order = input.required<Order>();
  readonly updating = input(false);
  readonly statusChange = output<OrderStatusChange>();

  protected readonly statusOptions = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];
  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly statusColors = ORDER_STATUS_COLORS;

  protected onStatusSelected(select: HTMLSelectElement): void {
    this.statusChange.emit({ orderId: this.order().id, status: select.value as OrderStatus });
  }
}
