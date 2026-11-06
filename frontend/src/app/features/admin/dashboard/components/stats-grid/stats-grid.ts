import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { AdminStats } from '@core/services/product.service';
import { CurrencyPenPipe } from '@shared/pipes';

interface StatCard {
  readonly icon: string;
  readonly variant: 'products' | 'revenue' | 'orders' | 'low-stock';
  readonly label: string;
  readonly value: number;
  readonly currency?: boolean;
  readonly warning?: boolean;
}

/** Tarjetas de métricas principales del panel. */
@Component({
  selector: 'app-stats-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPenPipe],
  templateUrl: './stats-grid.html',
  styleUrl: './stats-grid.scss',
})
export class StatsGrid {
  readonly stats = input.required<AdminStats>();

  protected readonly cards = computed<readonly StatCard[]>(() => {
    const stats = this.stats();
    return [
      { icon: 'inventory_2', variant: 'products', label: 'Productos', value: stats.totalProducts },
      { icon: 'attach_money', variant: 'revenue', label: 'Ingresos totales', value: stats.totalRevenue, currency: true },
      { icon: 'receipt_long', variant: 'orders', label: 'Pedidos', value: stats.totalOrders },
      { icon: 'warning', variant: 'low-stock', label: 'Stock bajo (<5)', value: stats.lowStock, warning: stats.lowStock > 0 },
    ];
  });
}
