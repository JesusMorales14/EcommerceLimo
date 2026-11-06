import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { OrderService } from '@core/services/order.service';
import { Pagination } from '@shared/components/pagination/pagination';
import { createClientPagination } from '@shared/utils/pagination';
import type { OrderStatusChange } from '../../components/admin-order-card/admin-order-card';
import { AdminOrderCard } from '../../components/admin-order-card/admin-order-card';

const PAGE_SIZE = 6;

/** Gestión de pedidos y de su estado de entrega. */
@Component({
  selector: 'app-admin-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AdminOrderCard, Pagination],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss',
})
export class AdminOrdersPage {
  private readonly orderService = inject(OrderService);

  protected readonly ordersResource = rxResource({ stream: () => this.orderService.getAllOrders() });
  protected readonly orders = computed(() => (this.ordersResource.hasValue() ? this.ordersResource.value() : []));
  protected readonly pager = createClientPagination(this.orders, PAGE_SIZE);
  protected readonly updatingId = signal<number | null>(null);

  protected updateStatus({ orderId, status }: OrderStatusChange): void {
    this.updatingId.set(orderId);
    this.orderService.updateStatus(orderId, status).subscribe({
      next: (updated) => {
        this.ordersResource.update((list) =>
          list?.map((order) => (order.id === orderId ? { ...order, status: updated.status } : order)),
        );
        this.updatingId.set(null);
      },
      error: () => this.updatingId.set(null),
    });
  }
}
