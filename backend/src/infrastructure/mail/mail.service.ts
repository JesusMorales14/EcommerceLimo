import { Inject, Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { APP_CONFIG } from '../../config/app-config.token';
import type { AppConfig } from '../../config/configuration';
import {
  claimResponseEmail,
  newClaimAdminEmail,
} from './templates/claim.templates';
import type {
  ClaimMailData,
  MailMessage,
  OrderMailData,
} from './templates/mail.types';
import { orderEmail } from './templates/order.template';

/**
 * Envío de notificaciones por correo (adaptador sobre Nodemailer).
 * Los fallos de envío se registran pero nunca interrumpen la operación de negocio.
 * Sin `MAIL_HOST` configurado, los correos solo se registran en el log (modo desarrollo).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    const { host, port, user, pass } = config.mail;
    this.transporter = host
      ? nodemailer.createTransport({ host, port, auth: { user, pass } })
      : null;
  }

  sendOrderConfirmation(order: OrderMailData): Promise<void> {
    return this.send(orderEmail(order, 'confirmation'));
  }

  sendOrderStatusUpdate(order: OrderMailData): Promise<void> {
    return this.send(orderEmail(order, 'status-update'));
  }

  async sendNewClaimToAdmin(claim: ClaimMailData): Promise<void> {
    const { adminEmail } = this.config.mail;
    if (adminEmail) await this.send(newClaimAdminEmail(claim, adminEmail));
  }

  async sendClaimResponse(claim: ClaimMailData): Promise<void> {
    if (claim.email)
      await this.send(claimResponseEmail(claim, this.config.frontendUrl));
  }

  private async send({ to, subject, html }: MailMessage): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[EMAIL → ${to}] ${subject}`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.config.mail.from,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Error al enviar email a ${to}: ${String(error)}`);
    }
  }
}
