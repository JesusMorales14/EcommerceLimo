import type {
  OrderStatus,
  ReclamacionBien,
  ReclamacionEstado,
  ReclamacionTipo,
} from '@prisma/client';

/** Datos mínimos de un pedido para notificar al cliente. */
export interface OrderMailData {
  id: number;
  status: OrderStatus;
  total: number;
  user: { name: string; email: string };
  items: {
    quantity: number;
    price: number;
    product?: { name: string } | null;
  }[];
}

/** Datos mínimos de una reclamación para las notificaciones. */
export interface ClaimMailData {
  id: number;
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  tipo: ReclamacionTipo;
  bien: ReclamacionBien;
  estado: ReclamacionEstado;
  pedidoNum?: string | null;
  detalle: string;
  accion?: string | null;
  respuesta?: string | null;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
}
