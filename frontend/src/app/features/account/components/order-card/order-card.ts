import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Order } from '@core/models/order.model';
import { ORDER_STATUS_COLORS } from '@core/models/order.model';
import { CurrencyPenPipe, OrderStatusPipe } from '@shared/pipes';
import { OrderTimeline } from '../order-timeline/order-timeline';

/** Hex con ~12% de opacidad para el fondo de la etiqueta de estado. */
const BADGE_BG_ALPHA = '20';

/** Tarjeta de un pedido del cliente con su seguimiento y detalle. */
@Component({
  selector: 'app-order-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, CurrencyPenPipe, OrderStatusPipe, OrderTimeline],
  templateUrl: './order-card.html',
  styleUrl: './order-card.scss',
})
export class OrderCard {
  readonly order = input.required<Order>();

  protected readonly statusColor = computed(() => ORDER_STATUS_COLORS[this.order().status]);
  protected readonly statusBackground = computed(() => this.statusColor() + BADGE_BG_ALPHA);
}
