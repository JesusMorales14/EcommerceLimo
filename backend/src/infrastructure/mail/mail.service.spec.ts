import * as nodemailer from 'nodemailer';
import type { AppConfig } from '../../config/configuration';
import { MailService } from './mail.service';
import type { ClaimMailData, OrderMailData } from './templates/mail.types';

jest.mock('nodemailer');

const baseConfig = (host?: string): AppConfig =>
  ({
    frontendUrl: 'https://tienda.pe',
    mail: {
      host,
      port: 587,
      from: 'no-reply@tienda.pe',
      adminEmail: 'admin@tienda.pe',
    },
  }) as AppConfig;

const ORDER: OrderMailData = {
  id: 7,
  status: 'PENDING',
  total: 120,
  user: { name: '<b>Ana</b>', email: 'ana@test.com' },
  items: [{ quantity: 2, price: 60, product: { name: 'Polo' } }],
};

const CLAIM: ClaimMailData = {
  id: 3,
  nombre: 'Ana',
  apellidos: 'Pérez',
  dni: '12345678',
  email: 'ana@test.com',
  telefono: '999',
  tipo: 'RECLAMO',
  bien: 'PRODUCTO',
  estado: 'RESUELTO',
  detalle: '<img src=x onerror=alert(1)>',
  respuesta: 'Reembolsado',
};

describe('MailService', () => {
  const sendMail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
  });

  it('sin MAIL_HOST solo registra el correo en el log', async () => {
    const service = new MailService(baseConfig());
    const log = jest
      .spyOn(service['logger'], 'log')
      .mockImplementation(() => undefined);
    await service.sendOrderConfirmation(ORDER);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('ana@test.com'));
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('envía la confirmación de pedido escapando el contenido del usuario', async () => {
    const service = new MailService(baseConfig('smtp.test'));
    await service.sendOrderConfirmation(ORDER);
    const message = sendMail.mock.calls[0][0];
    expect(message.subject).toContain('#7');
    expect(message.html).toContain('&lt;b&gt;Ana&lt;/b&gt;');
    expect(message.html).toContain('S/ 120.00');
  });

  it('envía la nueva reclamación al administrador sin HTML inyectado', async () => {
    const service = new MailService(baseConfig('smtp.test'));
    await service.sendNewClaimToAdmin(CLAIM);
    const message = sendMail.mock.calls[0][0];
    expect(message.to).toBe('admin@tienda.pe');
    expect(message.html).not.toContain('<img');
  });

  it('envía la respuesta al consumidor con el estado', async () => {
    const service = new MailService(baseConfig('smtp.test'));
    await service.sendClaimResponse(CLAIM);
    expect(sendMail.mock.calls[0][0].subject).toContain('Resuelto');
  });

  it('no propaga errores del servidor SMTP', async () => {
    sendMail.mockRejectedValueOnce(new Error('SMTP caído'));
    const service = new MailService(baseConfig('smtp.test'));
    jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
    await expect(service.sendOrderStatusUpdate(ORDER)).resolves.toBeUndefined();
  });
});
