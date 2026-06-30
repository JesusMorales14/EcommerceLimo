import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer');

describe('MailService', () => {
  const ORIGINAL_ENV = process.env;
  let sendMailMock: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    sendMailMock = jest.fn().mockResolvedValue(undefined);
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.clearAllMocks();
  });

  // ── sin transporter configurado (sin MAIL_HOST) ────────────────────────────────

  describe('sin MAIL_HOST configurado', () => {
    it('no crea un transporter ni intenta enviar correos', async () => {
      delete process.env.MAIL_HOST;
      const service = new MailService();

      await service.sendOrderConfirmation('user@test.com', {
        id: 1,
        total: 100,
        status: 'PENDING',
        items: [],
      });

      expect(nodemailer.createTransport).not.toHaveBeenCalled();
      expect(sendMailMock).not.toHaveBeenCalled();
    });

    it('no lanza error al intentar enviar sin transporter', async () => {
      delete process.env.MAIL_HOST;
      const service = new MailService();

      await expect(
        service.sendOrderConfirmation('user@test.com', {
          id: 1,
          total: 100,
          status: 'PENDING',
          items: [],
        }),
      ).resolves.toBeUndefined();
    });
  });

  // ── con transporter configurado ──────────────────────────────────────────────

  describe('con MAIL_HOST configurado', () => {
    beforeEach(() => {
      process.env.MAIL_HOST = 'smtp.test.com';
      process.env.MAIL_PORT = '587';
      process.env.MAIL_USER = 'user';
      process.env.MAIL_PASS = 'pass';
    });

    it('crea el transporter con la configuración de variables de entorno', () => {
      new MailService();

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 587,
        auth: { user: 'user', pass: 'pass' },
      });
    });

    it('envía el correo de confirmación de pedido con los datos esperados', async () => {
      const service = new MailService();

      await service.sendOrderConfirmation('user@test.com', {
        id: 42,
        total: 100,
        status: 'PENDING',
        user: { name: 'Juan' },
        items: [],
      });

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: expect.stringContaining('#42'),
          html: expect.stringContaining('Juan'),
        }),
      );
    });

    it('envía el correo de actualización de estado con los datos esperados', async () => {
      const service = new MailService();

      await service.sendStatusUpdate('user@test.com', {
        id: 42,
        total: 100,
        status: 'DELIVERED',
        items: [],
      });

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          subject: expect.stringContaining('#42'),
        }),
      );
    });

    it('envía el correo de reclamación al admin cuando ADMIN_EMAIL está configurado', async () => {
      process.env.ADMIN_EMAIL = 'admin@test.com';
      const service = new MailService();

      await service.sendReclamacionAdmin({
        id: 1,
        nombre: 'Ana',
        apellidos: 'Pérez',
        dni: '12345678',
        email: 'ana@test.com',
        telefono: '999999999',
        tipo: 'RECLAMO',
        bien: 'PRODUCTO',
        detalle: 'Producto defectuoso',
      });

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@test.com',
          subject: expect.stringContaining('Reclamo'),
        }),
      );
    });

    it('no envía correo de reclamación al admin si no hay ADMIN_EMAIL ni MAIL_USER', async () => {
      delete process.env.ADMIN_EMAIL;
      delete process.env.MAIL_USER;
      const service = new MailService();

      await service.sendReclamacionAdmin({
        id: 1,
        nombre: 'Ana',
        apellidos: 'Pérez',
        tipo: 'QUEJA',
      });

      expect(sendMailMock).not.toHaveBeenCalled();
    });

    it('envía respuesta de reclamación al usuario cuando tiene email', async () => {
      const service = new MailService();

      await service.sendReclamacionRespuesta({
        id: 1,
        nombre: 'Ana',
        apellidos: 'Pérez',
        email: 'ana@test.com',
        tipo: 'RECLAMO',
        estado: 'RESUELTO',
        respuesta: 'Ya fue solucionado',
      });

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'ana@test.com',
          subject: expect.stringContaining('Resuelto'),
        }),
      );
    });

    it('no envía respuesta de reclamación si el registro no tiene email', async () => {
      const service = new MailService();

      await service.sendReclamacionRespuesta({
        id: 1,
        nombre: 'Ana',
        tipo: 'RECLAMO',
        estado: 'RESUELTO',
      });

      expect(sendMailMock).not.toHaveBeenCalled();
    });

    it('captura el error de envío y no lo propaga', async () => {
      sendMailMock.mockRejectedValue(new Error('SMTP caído'));
      const service = new MailService();

      await expect(
        service.sendOrderConfirmation('user@test.com', {
          id: 1,
          total: 100,
          status: 'PENDING',
          items: [],
        }),
      ).resolves.toBeUndefined();
    });
  });
});
