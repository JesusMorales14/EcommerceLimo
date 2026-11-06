import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { MailService } from '../../infrastructure/mail/mail.service';
import type { TransactionRunner } from '../../infrastructure/prisma/transaction-runner';
import type { CouponsService } from '../coupons/coupons.service';
import type { ProductsRepository } from '../products/products.repository';
import type { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

const PRODUCT = { id: 1, name: 'Galaxy', price: 1000, discount: 10, stock: 5 };
const ORDER = {
  id: 7,
  status: 'PENDING',
  total: 900,
  items: [{ productId: 1, quantity: 1 }],
  user: { email: 'a@a.com' },
};
const tx = { tx: true };

describe('OrdersService', () => {
  const orders = {
    create: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
  };
  const products = {
    findByIds: jest.fn(),
    decrementStock: jest.fn(),
    incrementStock: jest.fn(),
  };
  const coupons = { quote: jest.fn(), redeem: jest.fn() };
  const transactions = {
    run: jest.fn((work: (t: unknown) => unknown) => work(tx)),
  };
  const mail = {
    sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
    sendOrderStatusUpdate: jest.fn().mockResolvedValue(undefined),
  };

  const service = new OrdersService(
    orders as unknown as OrdersRepository,
    products as unknown as ProductsRepository,
    coupons as unknown as CouponsService,
    transactions as unknown as TransactionRunner,
    mail as unknown as MailService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    products.findByIds.mockResolvedValue([PRODUCT]);
    products.decrementStock.mockResolvedValue(true);
    orders.create.mockResolvedValue(ORDER);
  });

  describe('createOrder', () => {
    it('crea el pedido con el precio del catálogo dentro de una transacción', async () => {
      await service.createOrder(3, {
        items: [
          { productId: 1, quantity: 1 },
          { productId: 1, quantity: 1 },
        ],
      });

      expect(transactions.run).toHaveBeenCalled();
      expect(products.decrementStock).toHaveBeenCalledWith(1, 2, tx);
      expect(orders.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 3,
          total: 1800,
          items: { create: [{ productId: 1, quantity: 2, price: 900 }] },
        }),
        tx,
      );
      expect(mail.sendOrderConfirmation).toHaveBeenCalledWith(ORDER);
    });

    it('aplica y canjea el cupón', async () => {
      coupons.quote.mockResolvedValue({ id: 4, finalAmount: 800 });
      await service.createOrder(3, {
        items: [{ productId: 1, quantity: 1 }],
        couponCode: ' DESC ',
      });
      expect(coupons.quote).toHaveBeenCalledWith('DESC', 900, tx);
      expect(coupons.redeem).toHaveBeenCalledWith(4, tx);
      expect(orders.create).toHaveBeenCalledWith(
        expect.objectContaining({ total: 800 }),
        tx,
      );
    });

    it('rechaza productos inexistentes o sin stock', async () => {
      products.findByIds.mockResolvedValue([]);
      await expect(
        service.createOrder(1, { items: [{ productId: 1, quantity: 1 }] }),
      ).rejects.toThrow(BadRequestException);

      products.findByIds.mockResolvedValue([PRODUCT]);
      products.decrementStock.mockResolvedValue(false);
      await expect(
        service.createOrder(1, { items: [{ productId: 1, quantity: 1 }] }),
      ).rejects.toThrow('Stock insuficiente');
      expect(orders.create).not.toHaveBeenCalled();
    });

    it('no falla si el correo de confirmación no se puede enviar', async () => {
      mail.sendOrderConfirmation.mockRejectedValueOnce(new Error('SMTP'));
      jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
      await expect(
        service.createOrder(1, { items: [{ productId: 1, quantity: 1 }] }),
      ).resolves.toBe(ORDER);
    });
  });

  describe('updateStatus', () => {
    it('lanza NotFound si el pedido no existe', async () => {
      orders.findById.mockResolvedValue(null);
      await expect(
        service.updateStatus(1, { status: 'SHIPPING' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('devuelve el stock al cancelar y notifica al cliente', async () => {
      orders.findById.mockResolvedValue(ORDER);
      orders.updateStatus.mockResolvedValue({ ...ORDER, status: 'CANCELLED' });
      await service.updateStatus(7, { status: 'CANCELLED' });
      expect(products.incrementStock).toHaveBeenCalledWith(1, 1, tx);
      expect(mail.sendOrderStatusUpdate).toHaveBeenCalled();
    });

    it('no devuelve stock en otros cambios de estado', async () => {
      orders.findById.mockResolvedValue(ORDER);
      orders.updateStatus.mockResolvedValue(ORDER);
      await service.updateStatus(7, { status: 'SHIPPING' });
      expect(products.incrementStock).not.toHaveBeenCalled();
    });
  });

  it('consultas delegan en el repositorio', async () => {
    orders.findByUser.mockResolvedValue([ORDER]);
    orders.findAll.mockResolvedValue([ORDER]);
    await expect(service.getUserOrders(1)).resolves.toHaveLength(1);
    await expect(service.getAllOrders()).resolves.toHaveLength(1);
  });
});
