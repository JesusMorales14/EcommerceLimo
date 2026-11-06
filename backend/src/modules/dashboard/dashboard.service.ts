import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

export const LOW_STOCK_THRESHOLD = 5;
export const RECENT_ORDERS_LIMIT = 5;

/** Métricas del panel de administración. */
@Injectable()
export class DashboardService {
  constructor(private readonly dashboard: DashboardRepository) {}

  getStats() {
    return this.dashboard.getStats(LOW_STOCK_THRESHOLD, RECENT_ORDERS_LIMIT);
  }
}
