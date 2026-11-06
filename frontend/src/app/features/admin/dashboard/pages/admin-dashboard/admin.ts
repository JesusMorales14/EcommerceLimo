import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductService } from '@core/services/product.service';
import { AdminNavCards } from '../../components/admin-nav-cards/admin-nav-cards';
import { RecentOrdersTable } from '../../components/recent-orders-table/recent-orders-table';
import { StatsGrid } from '../../components/stats-grid/stats-grid';

/** Inicio del panel de administración: métricas y accesos. */
@Component({
  selector: 'app-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatsGrid, RecentOrdersTable, AdminNavCards],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminPage {
  private readonly productService = inject(ProductService);
  protected readonly statsResource = rxResource({ stream: () => this.productService.getStats() });
}
