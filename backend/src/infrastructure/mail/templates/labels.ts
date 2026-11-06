import type {
  OrderStatus,
  ReclamacionBien,
  ReclamacionEstado,
  ReclamacionTipo,
} from '@prisma/client';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente de confirmación',
  PROCESSING: 'En proceso',
  SHIPPING: 'En camino a tu dirección',
  READY_FOR_PICKUP: 'Listo para retiro en tienda',
  DELIVERED: 'Entregado exitosamente',
  CANCELLED: 'Cancelado',
};

export const CLAIM_TYPE_LABELS: Record<ReclamacionTipo, string> = {
  RECLAMO: 'Reclamo',
  QUEJA: 'Queja',
};

export const CLAIM_ITEM_LABELS: Record<ReclamacionBien, string> = {
  PRODUCTO: 'Producto',
  SERVICIO: 'Servicio',
};

export const CLAIM_STATUS_LABELS: Record<ReclamacionEstado, string> = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  RESUELTO: 'Resuelto',
  CERRADO: 'Cerrado',
};
