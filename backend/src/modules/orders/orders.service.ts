import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { MailService } from '../../infrastructure/mail/mail.service';
import {
  type TransactionClient,
  TransactionRunner,
} from '../../infrastructure/prisma/transaction-runner';
import { CouponsService } from '../coupons/coupons.service';
import { ProductsRepository } from '../products/products.repository';
import {
  buildOrderLines,
  mergeItems,
  type OrderLine,
  OrderValidationError,
  subtotalOf,
} from './domain/order-lines';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { UpdateStatusDto } from './dto/update-status.dto';
import { type OrderWithDetails, OrdersRepository } from './orders.repository';

/** Casos de uso de pedidos: compra, consulta y ciclo de vida. */
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly orders: OrdersRepository,
    private readonly products: ProductsRepository,
    private readonly coupons: CouponsService,
    private readonly transactions: TransactionRunner,
    private readonly mail: MailService,
  ) {}

  /**
   * Crea un pedido de forma atómica: valida productos, reserva stock, aplica
   * el cupón y registra el pedido en una única transacción. Si algo falla no
   * queda stock descontado ni cupón consumido.
   */
  async createOrder(
    userId: number,
    dto: CreateOrderDto,
  ): Promise<OrderWithDetails> {
    const order = await this.transactions.run(async (tx) => {
      const lines = await this.buildLines(dto, tx);
      await this.reserveStock(lines, tx);
      const total = await this.applyCoupon(
        dto.couponCode,
        subtotalOf(lines),
        tx,
      );
      return this.orders.create(
        {
          userId,
          total,
          paymentMethod: dto.paymentMethod,
          deliveryName: dto.delivery?.name,
          deliveryPhone: dto.delivery?.phone,
          deliveryAddress: dto.delivery?.address,
          deliveryNotes: dto.delivery?.notes,
          deliveryLat: dto.delivery?.lat,
          deliveryLng: dto.delivery?.lng,
          items: { create: lines },
        },
        tx,
      );
    });
    this.notify(() => this.mail.sendOrderConfirmation(order));
    return order;
  }

  getUserOrders(userId: number): Promise<OrderWithDetails[]> {
    return this.orders.findByUser(userId);
  }

  getAllOrders(): Promise<OrderWithDetails[]> {
    return this.orders.findAll();
  }

  /** Cambia el estado; al cancelar un pedido se devuelve el stock reservado. */
  async updateStatus(
    orderId: number,
    { status }: UpdateStatusDto,
  ): Promise<OrderWithDetails> {
    const updated = await this.transactions.run(async (tx) => {
      const current = await this.orders.findById(orderId, tx);
      if (!current) throw new NotFoundException('Pedido no encontrado');
      if (
        status === OrderStatus.CANCELLED &&
        current.status !== OrderStatus.CANCELLED
      ) {
        await Promise.all(
          current.items.map((item) =>
            this.products.incrementStock(item.productId, item.quantity, tx),
          ),
        );
      }
      return this.orders.updateStatus(orderId, status, tx);
    });
    this.notify(() => this.mail.sendOrderStatusUpdate(updated));
    return updated;
  }

  private async buildLines(
    dto: CreateOrderDto,
    tx: TransactionClient,
  ): Promise<OrderLine[]> {
    const items = mergeItems(dto.items);
    const products = await this.products.findByIds(
      items.map((item) => item.productId),
      tx,
    );
    try {
      return buildOrderLines(items, products);
    } catch (error) {
      if (error instanceof OrderValidationError)
        throw new BadRequestException(error.message);
      throw error;
    }
  }

  private async reserveStock(
    lines: readonly OrderLine[],
    tx: TransactionClient,
  ): Promise<void> {
    for (const line of lines) {
      if (
        !(await this.products.decrementStock(line.productId, line.quantity, tx))
      ) {
        throw new BadRequestException(
          `Stock insuficiente para el producto ${line.productId}`,
        );
      }
    }
  }

  private async applyCoupon(
    code: string | undefined,
    subtotal: number,
    tx: TransactionClient,
  ): Promise<number> {
    if (!code?.trim()) return subtotal;
    const quote = await this.coupons.quote(code.trim(), subtotal, tx);
    await this.coupons.redeem(quote.id, tx);
    return quote.finalAmount;
  }

  /** Las notificaciones no son críticas: un fallo se registra y no afecta al pedido. */
  private notify(send: () => Promise<void>): void {
    send().catch((error: unknown) =>
      this.logger.warn(`No se pudo notificar por correo: ${String(error)}`),
    );
  }
}
