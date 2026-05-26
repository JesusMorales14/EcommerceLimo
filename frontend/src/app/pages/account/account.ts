import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus, ORDER_STATUS_COLORS } from '../../core/models/order.model';
import { CurrencyPenPipe, OrderStatusPipe } from '../../shared/pipes';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPenPipe, OrderStatusPipe],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class AccountPage implements OnInit {
  authService  = inject(AuthService);
  orderService = inject(OrderService);
  private auth = inject(AuthService);

  orders       = signal<Order[]>([]);
  loading      = signal(true);
  orderSuccess = signal(history.state?.orderSuccess === true);

  editMode    = signal(false);
  saving      = signal(false);
  editName    = '';
  editPhone   = '';
  editAddress = '';

  STATUS_COLORS = ORDER_STATUS_COLORS;

  readonly TIMELINE_STEPS: { status: OrderStatus; label: string; icon: string }[] = [
    { status: 'PENDING',          label: 'Pendiente',    icon: 'schedule' },
    { status: 'PROCESSING',       label: 'En proceso',   icon: 'inventory' },
    { status: 'SHIPPING',         label: 'En camino',    icon: 'local_shipping' },
    { status: 'READY_FOR_PICKUP', label: 'Para retiro',  icon: 'store' },
    { status: 'DELIVERED',        label: 'Entregado',    icon: 'check_circle' },
  ];

  private readonly STATUS_ORDER: OrderStatus[] = [
    'PENDING', 'PROCESSING', 'SHIPPING', 'READY_FOR_PICKUP', 'DELIVERED',
  ];

  isStepDone(current: OrderStatus, step: OrderStatus): boolean {
    return this.STATUS_ORDER.indexOf(current) > this.STATUS_ORDER.indexOf(step);
  }

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: (o) => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openEdit() {
    const u = this.authService.user()!;
    this.editName    = u.name;
    this.editPhone   = u.phone   ?? '';
    this.editAddress = u.address ?? '';
    this.editMode.set(true);
  }

  cancelEdit() { this.editMode.set(false); }

  saveProfile() {
    this.saving.set(true);
    this.auth.updateProfile({
      name:    this.editName    || undefined,
      phone:   this.editPhone   || undefined,
      address: this.editAddress || undefined,
    }).subscribe({
      next:  () => { this.saving.set(false); this.editMode.set(false); },
      error: () => this.saving.set(false),
    });
  }

  logout() { this.auth.logout(); }
}
