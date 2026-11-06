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
  paymentMethod?: string;
  deliveryName?: string;
  deliveryPhone?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
}

export interface OrderTimelineStep {
  readonly status: OrderStatus;
  readonly label: string;
  readonly icon: string;
}

/** Pasos visibles del seguimiento de un pedido (en orden de avance). */
export const ORDER_TIMELINE_STEPS: readonly OrderTimelineStep[] = [
  { status: 'PENDING', label: 'Pendiente', icon: 'schedule' },
  { status: 'PROCESSING', label: 'En proceso', icon: 'inventory' },
  { status: 'SHIPPING', label: 'En camino', icon: 'local_shipping' },
  { status: 'READY_FOR_PICKUP', label: 'Para retiro', icon: 'store' },
  { status: 'DELIVERED', label: 'Entregado', icon: 'check_circle' },
];

/** Indica si `step` ya fue superado por el estado actual del pedido. */
export function isOrderStepDone(current: OrderStatus, step: OrderStatus): boolean {
  const order = ORDER_TIMELINE_STEPS.map((s) => s.status);
  return order.indexOf(current) > order.indexOf(step);
}
