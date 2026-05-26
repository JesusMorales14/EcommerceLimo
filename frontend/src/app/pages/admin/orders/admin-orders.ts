import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus, ORDER_STATUS_COLORS } from '../../../core/models/order.model';
import { CurrencyPenPipe, OrderStatusPipe } from '../../../shared/pipes';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPenPipe, OrderStatusPipe],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss'
})
export class AdminOrdersPage implements OnInit {
  private orderService = inject(OrderService);

  orders   = signal<Order[]>([]);
  loading  = signal(true);
  updating = signal<number | null>(null);

  STATUS_COLORS = ORDER_STATUS_COLORS;

  readonly STATUS_OPTIONS: OrderStatus[] = [
    'PENDING', 'PROCESSING', 'SHIPPING', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'
  ];

  readonly PAGE_SIZE = 6;
  currentPage = signal(1);

  pagedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.orders().slice(start, start + this.PAGE_SIZE);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.orders().length / this.PAGE_SIZE)));

  visiblePages = computed(() => {
    const cur = this.currentPage();
    const end = Math.min(cur + 2, this.totalPages());
    return Array.from({ length: end - cur + 1 }, (_, i) => cur + i);
  });

  showEllipsis = computed(() => this.currentPage() + 2 < this.totalPages());

  ngOnInit() {
    this.orderService.getAllOrders().subscribe({
      next: (o) => { this.orders.set(o); this.currentPage.set(1); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  updateStatus(orderId: number, status: OrderStatus) {
    this.updating.set(orderId);
    this.orderService.updateStatus(orderId, status).subscribe({
      next: (updated) => {
        this.orders.update(list => list.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
        this.updating.set(null);
      },
      error: () => this.updating.set(null)
    });
  }
}
