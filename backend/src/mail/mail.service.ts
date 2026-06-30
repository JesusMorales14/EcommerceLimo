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

  async sendReclamacionAdmin(rec: any) {
    const adminEmail = process.env.ADMIN_EMAIL ?? process.env.MAIL_USER;
    if (!adminEmail) return;
    const tipo = rec.tipo === 'RECLAMO' ? 'Reclamo' : 'Queja';
    await this.send(
      adminEmail,
      `📋 Nueva ${tipo} #${rec.id} — ${rec.nombre} ${rec.apellidos}`,
      this.buildReclamacionHtml(rec),
    );
  }

  async sendReclamacionRespuesta(rec: any) {
    if (!rec.email) return;
    const tipo = rec.tipo === 'RECLAMO' ? 'Reclamo' : 'Queja';
    const estado =
      {
        PENDIENTE: 'Pendiente',
        EN_REVISION: 'En revisión',
        RESUELTO: 'Resuelto',
        CERRADO: 'Cerrado',
      }[rec.estado as string] ?? rec.estado;
    await this.send(
      rec.email,
      `📋 Actualización de tu ${tipo} #${rec.id} — ${estado}`,
      this.buildRespuestaHtml(rec, estado),
    );
  }

  private buildRespuestaHtml(rec: any, estadoLabel: string) {
    const respuestaBlock = rec.respuesta
      ? `<p style="color:#64748b;margin:4px 0 8px"><strong>Respuesta de EcommerceLimo:</strong></p>
         <p style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px 16px;border-radius:0 8px 8px 0;margin:0;font-size:15px;color:#1a1a1a;line-height:1.6">${rec.respuesta}</p>`
      : `<p style="color:#64748b;font-style:italic">Tu reclamo está siendo atendido. Te informaremos cuando tengamos una respuesta.</p>`;

    return `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#006b2d;margin:0 0 4px">EcommerceLimo</h2>
        <p style="color:#64748b;margin:0 0 24px;font-size:14px">Libro de Reclamaciones</p>

        <p>Hola <strong>${rec.nombre} ${rec.apellidos}</strong>,</p>
        <p>Tu <strong>${rec.tipo === 'RECLAMO' ? 'reclamo' : 'queja'} #${rec.id}</strong> ha sido actualizado.</p>

        <div style="background:#f4f7f4;border-radius:10px;padding:14px 18px;margin:16px 0;display:inline-block">
          <span style="font-size:13px;color:#64748b">Estado actual</span><br>
          <strong style="font-size:18px;color:#006b2d">${estadoLabel}</strong>
        </div>

        ${respuestaBlock}

        <p style="margin-top:24px">Puedes consultar el estado completo de tu reclamación en cualquier momento:</p>
        <a href="${process.env.FRONTEND_URL ?? 'http://localhost:4200'}/mis-reclamaciones"
           style="display:inline-block;background:#006b2d;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:4px">
          Ver mis reclamaciones
        </a>

        <p style="color:#94a3b8;font-size:12px;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px">
          Plazo máximo de respuesta: 30 días calendario desde la fecha de registro.<br>
          EcommerceLimo · Ley N° 29571
        </p>
      </div>`;
  }

  private buildReclamacionHtml(rec: any) {
    return `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#006b2d">EcommerceLimo — Nueva ${rec.tipo === 'RECLAMO' ? 'Reclamación' : 'Queja'}</h2>
        <p style="background:#f4f7f4;padding:12px;border-radius:8px">
          <strong>N° de referencia:</strong> #${rec.id}
        </p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:6px 0;color:#64748b">Nombre</td><td><strong>${rec.nombre} ${rec.apellidos}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#64748b">DNI/CE</td><td>${rec.dni}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Email</td><td>${rec.email}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Teléfono</td><td>${rec.telefono}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Tipo</td><td>${rec.tipo === 'RECLAMO' ? 'Reclamo' : 'Queja'}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b">Bien</td><td>${rec.bien === 'PRODUCTO' ? 'Producto' : 'Servicio'}</td></tr>
          ${rec.pedidoNum ? `<tr><td style="padding:6px 0;color:#64748b">N° Pedido</td><td>${rec.pedidoNum}</td></tr>` : ''}
        </table>
        <p style="color:#64748b;margin:4px 0"><strong>Descripción:</strong></p>
        <p style="background:#f4f7f4;padding:12px;border-radius:8px;margin:8px 0">${rec.detalle}</p>
        ${rec.accion ? `<p style="color:#64748b;margin:4px 0"><strong>Pedido del consumidor:</strong></p><p style="background:#f4f7f4;padding:12px;border-radius:8px;margin:8px 0">${rec.accion}</p>` : ''}
        <p style="color:#64748b;font-size:12px;margin-top:24px">Plazo máximo de respuesta: 30 días calendario.</p>
      </div>`;
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.log(`[EMAIL → ${to}] ${subject}`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM ?? 'noreply@editorialgreehouse.com',
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Error al enviar email a ${to}: ${String(err)}`);
    }
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
        <p style="color:#64748b;font-size:12px">Gracias por confiar en EcommerceLimo.</p>
      </div>`;
  }
}
