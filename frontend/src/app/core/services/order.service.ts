import { inject, Injectable } from '@angular/core';
import { Order, OrderStatus } from '../models/order.model';
import { ApiService } from './api.service';

export interface OrderItemInput { productId: number; quantity: number; }
export interface DeliveryInfo {
  name: string; phone: string; address: string; notes: string;
  lat?: number; lng?: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = inject(ApiService);

  createOrder(items: OrderItemInput[], paymentMethod?: string, delivery?: DeliveryInfo, couponCode?: string) {
    return this.api.post<Order>('/orders', { items, paymentMethod, delivery, couponCode });
  }

  getMyOrders() {
    return this.api.get<Order[]>('/orders/mine');
  }

  getAllOrders() {
    return this.api.get<Order[]>('/orders/all');
  }

  updateStatus(orderId: number, status: OrderStatus) {
    return this.api.patch<Order>(`/orders/${orderId}/status`, { status });
  }
}
