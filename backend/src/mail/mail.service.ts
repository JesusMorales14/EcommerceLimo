import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente de confirmación',
  PROCESSING: 'En proceso',
  SHIPPING: 'En camino a tu dirección',
  READY_FOR_PICKUP: 'Listo para retiro en tienda',
  DELIVERED: 'Entregado exitosamente',
  CANCELLED: 'Cancelado',
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (process.env.MAIL_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT ?? 587),
        auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
      });
    }
  }

  async sendOrderConfirmation(to: string, order: any) {
    await this.send(
      to,
      `✅ Confirmación de pedido #${order.id}`,
      this.buildHtml(order, 'confirmación'),
    );
  }

  async sendStatusUpdate(to: string, order: any) {
    await this.send(
      to,
      `📦 Actualización de tu pedido #${order.id}`,
      this.buildHtml(order, 'actualización'),
    );
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`[EMAIL → ${to}] ${subject}`);
      return;
    }
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM ?? 'noreply@editorialgreehouse.com',
      to,
      subject,
      html,
    });
  }

  private buildHtml(order: any, type: string) {
    const items = (order.items ?? [])
      .map(
        (i: any) => `<tr>
        <td>${i.product?.name ?? 'Producto'}</td>
        <td>${i.quantity}</td>
        <td>$${i.price}</td>
      </tr>`,
      )
      .join('');

    return `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#006b2d">EcommerceLimo</h2>
        <p>Hola <strong>${order.user?.name ?? ''}</strong>,</p>
        <p>Tienes una <strong>${type}</strong> en tu pedido <strong>#${order.id}</strong>.</p>
        <p>Estado actual: <strong style="color:#006b2d">${STATUS_LABELS[order.status] ?? order.status}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#f4f7f4">
            <th align="left" style="padding:8px">Producto</th>
            <th align="left" style="padding:8px">Qty</th>
            <th align="left" style="padding:8px">Precio</th>
          </tr></thead>
          <tbody>${items}</tbody>
        </table>
        <p style="font-size:18px"><strong>Total: $${order.total}</strong></p>
        <p style="color:#64748b;font-size:12px">Gracias por confiar en The Editorial Greenhouse.</p>
      </div>`;
  }
}
