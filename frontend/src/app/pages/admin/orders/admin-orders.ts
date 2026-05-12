import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../../core/models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss'
})
export class AdminOrdersPage implements OnInit {
  private orderService = inject(OrderService);

  orders  = signal<Order[]>([]);
  loading = signal(true);
  updating = signal<number | null>(null);

  STATUS_LABELS = ORDER_STATUS_LABELS;
  STATUS_COLORS = ORDER_STATUS_COLORS;

  readonly STATUS_OPTIONS: OrderStatus[] = [
    'PENDING', 'PROCESSING', 'SHIPPING', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'
  ];

  ngOnInit() {
    this.orderService.getAllOrders().subscribe({
      next: (o) => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
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
