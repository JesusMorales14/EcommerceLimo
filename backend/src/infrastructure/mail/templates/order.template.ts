import { escapeHtml } from '../../../common/utils/escape-html';
import { ORDER_STATUS_LABELS } from './labels';
import { emailLayout, styles } from './layout';
import type { MailMessage, OrderMailData } from './mail.types';

export type OrderMailKind = 'confirmation' | 'status-update';

const SUBJECTS: Record<OrderMailKind, (id: number) => string> = {
  confirmation: (id) => `✅ Confirmación de pedido #${id}`,
  'status-update': (id) => `📦 Actualización de tu pedido #${id}`,
};

const INTRO: Record<OrderMailKind, string> = {
  confirmation: 'confirmación',
  'status-update': 'actualización',
};

const formatPen = (amount: number) => `S/ ${amount.toFixed(2)}`;

/** Correo de confirmación o de cambio de estado de un pedido. */
export function orderEmail(
  order: OrderMailData,
  kind: OrderMailKind,
): MailMessage {
  const rows = order.items
    .map(
      (item) => `<tr>
        <td style="padding:6px 8px">${escapeHtml(item.product?.name ?? 'Producto')}</td>
        <td style="padding:6px 8px">${item.quantity}</td>
        <td style="padding:6px 8px">${formatPen(item.price)}</td>
      </tr>`,
    )
    .join('');

  const content = `
    <p>Hola <strong>${escapeHtml(order.user.name)}</strong>,</p>
    <p>Tienes una <strong>${INTRO[kind]}</strong> en tu pedido <strong>#${order.id}</strong>.</p>
    <p>Estado actual: <strong style="color:${styles.brand}">${ORDER_STATUS_LABELS[order.status]}</strong></p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead><tr style="background:#f4f7f4">
        <th align="left" style="padding:8px">Producto</th>
        <th align="left" style="padding:8px">Cant.</th>
        <th align="left" style="padding:8px">Precio</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:18px"><strong>Total: ${formatPen(order.total)}</strong></p>`;

  return {
    to: order.user.email,
    subject: SUBJECTS[kind](order.id),
    html: emailLayout(content),
  };
}
