import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CouponsService } from '../coupons/coupons.service';

const mockProduct = {
  id: 1,
  name: 'Samsung Galaxy S24',
  brand: 'Samsung',
  price: 1899,
  stock: 5,
  category: 'tecnologia',
  subCategory: 'smartphones',
  description: '',
  images: [],
  colors: [],
  sizes: [],
  isOffer: false,
  discount: null,
  colorImages: {},
  createdAt: new Date(),
};

const mockOrder = {
  id: 1,
  userId: 1,
  total: 1899,
  status: 'PENDIENTE',
  paymentMethod: 'TARJETA',
  createdAt: new Date(),
  deliveryName: null,
  deliveryPhone: null,
  deliveryAddress: null,
  deliveryNotes: null,
  deliveryLat: null,
  deliveryLng: null,
  items: [{ productId: 1, quantity: 1, price: 1899, product: mockProduct }],
  user: { id: 1, name: 'Test User', email: 'test@tienda.com' },
};

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: any;
  let mail: any;
  let coupons: any;

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    mail = {
      sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
      sendStatusUpdate: jest.fn().mockResolvedValue(undefined),
    };
    coupons = {
      validate: jest.fn(),
      use: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: mail },
        { provide: CouponsService, useValue: coupons },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  // ── createOrder ──────────────────────────────────────────────────────────────

  describe('createOrder', () => {
    it('crea la orden y retorna los datos completos', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.order.create.mockResolvedValue(mockOrder);
      prisma.product.update.mockResolvedValue({});

      const result = await service.createOrder(1, {
        items: [{ productId: 1, quantity: 1 }],
        paymentMethod: 'TARJETA',
      } as any);

      expect(result.id).toBe(1);
      expect(result.total).toBe(1899);
    });

    it('descuenta el stock del producto tras crear la orden', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.order.create.mockResolvedValue(mockOrder);
      prisma.product.update.mockResolvedValue({});

      await service.createOrder(1, {
        items: [{ productId: 1, quantity: 2 }],
        paymentMethod: 'TARJETA',
      } as any);

      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { stock: { decrement: 2 } } }),
      );
    });

    it('envía el correo de confirmación al crear la orden', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.order.create.mockResolvedValue(mockOrder);
      prisma.product.update.mockResolvedValue({});

      await service.createOrder(1, {
        items: [{ productId: 1, quantity: 1 }],
        paymentMethod: 'TARJETA',
      } as any);

      expect(mail.sendOrderConfirmation).toHaveBeenCalledWith(
        'test@tienda.com',
        expect.any(Object),
      );
    });

    it('lanza BadRequestException si el producto no existe', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrder(1, {
          items: [{ productId: 999, quantity: 1 }],
          paymentMethod: 'TARJETA',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si el stock es insuficiente', async () => {
      prisma.product.findUnique.mockResolvedValue({ ...mockProduct, stock: 1 });

      await expect(
        service.createOrder(1, {
          items: [{ productId: 1, quantity: 5 }],
          paymentMethod: 'TARJETA',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('no decrementa stock si la validación falla', async () => {
      prisma.product.findUnique.mockResolvedValue({ ...mockProduct, stock: 0 });

      await expect(
        service.createOrder(1, {
          items: [{ productId: 1, quantity: 1 }],
          paymentMethod: 'TARJETA',
        } as any),
      ).rejects.toThrow();

      expect(prisma.product.update).not.toHaveBeenCalled();
    });

    it('aplica el cupón y reduce el total cuando se envía couponCode', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.product.update.mockResolvedValue({});
      coupons.validate.mockResolvedValue({ finalAmount: 1520 });
      prisma.order.create.mockResolvedValue({ ...mockOrder, total: 1520 });

      const result = await service.createOrder(1, {
        items: [{ productId: 1, quantity: 1 }],
        paymentMethod: 'TARJETA',
        couponCode: 'DESCUENTO20',
      } as any);

      expect(coupons.validate).toHaveBeenCalledWith('DESCUENTO20', 1899);
      expect(result.total).toBe(1520);
    });
  });

  // ── getUserOrders ────────────────────────────────────────────────────────────

  describe('getUserOrders', () => {
    it('retorna las órdenes del usuario indicado', async () => {
      prisma.order.findMany.mockResolvedValue([mockOrder]);

      const result = await service.getUserOrders(1);

      expect(result).toHaveLength(1);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 1 } }),
      );
    });

    it('retorna arreglo vacío si el usuario no tiene órdenes', async () => {
      prisma.order.findMany.mockResolvedValue([]);

      const result = await service.getUserOrders(99);

      expect(result).toHaveLength(0);
    });
  });

  // ── updateStatus ─────────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('actualiza el estado de la orden y lo retorna', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'ENVIADO',
      });

      const result = await service.updateStatus(1, {
        status: 'ENVIADO',
      } as any);

      expect(result.status).toBe('ENVIADO');
    });

    it('envía correo de actualización de estado al usuario', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'ENTREGADO',
      });

      await service.updateStatus(1, { status: 'ENTREGADO' } as any);

      expect(mail.sendStatusUpdate).toHaveBeenCalledWith(
        'test@tienda.com',
        expect.any(Object),
      );
    });

    it('lanza NotFoundException si la orden no existe', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus(999, { status: 'ENVIADO' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('no actualiza si la orden no existe', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus(999, { status: 'ENVIADO' } as any),
      ).rejects.toThrow();

      expect(prisma.order.update).not.toHaveBeenCalled();
    });
  });
});
