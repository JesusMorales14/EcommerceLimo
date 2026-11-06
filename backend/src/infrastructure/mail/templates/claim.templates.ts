import { escapeHtml } from '../../../common/utils/escape-html';
import {
  CLAIM_ITEM_LABELS,
  CLAIM_STATUS_LABELS,
  CLAIM_TYPE_LABELS,
} from './labels';
import { emailLayout, styles } from './layout';
import type { ClaimMailData, MailMessage } from './mail.types';

const LEGAL_FOOTER =
  'Plazo máximo de respuesta: 30 días calendario desde la fecha de registro.<br>EcommerceLimo · Ley N° 29571';

const row = (label: string, value: string) =>
  `<tr><td style="${styles.cell}">${label}</td><td>${value}</td></tr>`;

/** Aviso al administrador de una nueva reclamación. */
export function newClaimAdminEmail(
  claim: ClaimMailData,
  adminEmail: string,
): MailMessage {
  const type = CLAIM_TYPE_LABELS[claim.tipo];
  const fullName = escapeHtml(`${claim.nombre} ${claim.apellidos}`);
  const content = `
    <h3 style="margin:0">Nueva ${type === 'Reclamo' ? 'reclamación' : 'queja'}</h3>
    <p style="${styles.box}"><strong>N° de referencia:</strong> #${claim.id}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      ${row('Nombre', `<strong>${fullName}</strong>`)}
      ${row('DNI/CE', escapeHtml(claim.dni))}
      ${row('Email', escapeHtml(claim.email))}
      ${row('Teléfono', escapeHtml(claim.telefono))}
      ${row('Tipo', type)}
      ${row('Bien', CLAIM_ITEM_LABELS[claim.bien])}
      ${claim.pedidoNum ? row('N° Pedido', escapeHtml(claim.pedidoNum)) : ''}
    </table>
    <p style="color:${styles.muted};margin:4px 0"><strong>Descripción:</strong></p>
    <p style="${styles.box}">${escapeHtml(claim.detalle)}</p>
    ${
      claim.accion
        ? `<p style="color:${styles.muted};margin:4px 0"><strong>Pedido del consumidor:</strong></p>
           <p style="${styles.box}">${escapeHtml(claim.accion)}</p>`
        : ''
    }`;

  return {
    to: adminEmail,
    subject: `📋 Nueva ${type} #${claim.id} — ${claim.nombre} ${claim.apellidos}`,
    html: emailLayout(content, LEGAL_FOOTER),
  };
}

/** Notificación al consumidor del cambio de estado / respuesta de su reclamación. */
export function claimResponseEmail(
  claim: ClaimMailData,
  frontendUrl: string,
): MailMessage {
  const type = CLAIM_TYPE_LABELS[claim.tipo];
  const status = CLAIM_STATUS_LABELS[claim.estado];
  const response = claim.respuesta
    ? `<p style="color:${styles.muted};margin:4px 0 8px"><strong>Respuesta de EcommerceLimo:</strong></p>
       <p style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px 16px;margin:0;line-height:1.6">${escapeHtml(claim.respuesta)}</p>`
    : `<p style="color:${styles.muted};font-style:italic">Tu reclamo está siendo atendido. Te informaremos cuando tengamos una respuesta.</p>`;

  const content = `
    <p>Hola <strong>${escapeHtml(`${claim.nombre} ${claim.apellidos}`)}</strong>,</p>
    <p>Tu <strong>${type.toLowerCase()} #${claim.id}</strong> ha sido actualizado.</p>
    <div style="${styles.box};display:inline-block">
      <span style="font-size:13px;color:${styles.muted}">Estado actual</span><br>
      <strong style="font-size:18px;color:${styles.brand}">${status}</strong>
    </div>
    ${response}
    <p style="margin-top:24px">Puedes consultar el estado completo de tu reclamación en cualquier momento:</p>
    <a href="${escapeHtml(frontendUrl)}/mis-reclamaciones"
       style="display:inline-block;background:${styles.brand};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">
      Ver mis reclamaciones
    </a>`;

  return {
    to: claim.email,
    subject: `📋 Actualización de tu ${type} #${claim.id} — ${status}`,
    html: emailLayout(content, LEGAL_FOOTER),
  };
}
