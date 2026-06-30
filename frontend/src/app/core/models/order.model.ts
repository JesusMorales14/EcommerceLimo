import type { Product } from './product.model';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'READY_FOR_PICKUP'
  | 'DELIVERED'
  | 'CANCELLED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:          'Pendiente',
  PROCESSING:       'En proceso',
  SHIPPING:         'En camino',
  READY_FOR_PICKUP: 'Listo para retiro',
  DELIVERED:        'Entregado',
  CANCELLED:        'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:          '#f59e0b',
  PROCESSING:       '#3b82f6',
  SHIPPING:         '#8b5cf6',
  READY_FOR_PICKUP: '#06b6d4',
  DELIVERED:        '#006b2d',
  CANCELLED:        '#ba1a1a',
};

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  createdAt: string;
  userId: number;
  items: OrderItem[];
  user?: { id: number; name: string; email: string };
}
