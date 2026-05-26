import { Pipe, PipeTransform } from '@angular/core';
import { ORDER_STATUS_LABELS, type OrderStatus } from '../../core/models/order.model';

@Pipe({ name: 'orderStatus', standalone: true, pure: true })
export class OrderStatusPipe implements PipeTransform {
  transform(value: OrderStatus | string | null | undefined): string {
    if (!value) return '';
    return ORDER_STATUS_LABELS[value as OrderStatus] ?? value;
  }
}
