import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { OrderStatus } from '@core/models/order.model';
import { isOrderStepDone, ORDER_TIMELINE_STEPS } from '@core/models/order.model';

/** Línea de tiempo del estado de un pedido. */
@Component({
  selector: 'app-order-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-timeline.html',
  styleUrl: './order-timeline.scss',
})
export class OrderTimeline {
  readonly status = input.required<OrderStatus>();

  protected readonly steps = ORDER_TIMELINE_STEPS;
  protected readonly isDone = isOrderStepDone;
}
