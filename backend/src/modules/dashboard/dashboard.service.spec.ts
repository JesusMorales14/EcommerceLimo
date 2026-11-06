import { DashboardController } from './dashboard.controller';
import type { DashboardRepository } from './dashboard.repository';
import {
  DashboardService,
  LOW_STOCK_THRESHOLD,
  RECENT_ORDERS_LIMIT,
} from './dashboard.service';

describe('DashboardService / Controller', () => {
  it('obtiene las métricas con los umbrales configurados', async () => {
    const repo = {
      getStats: jest.fn().mockResolvedValue({ totalProducts: 3 }),
    };
    const service = new DashboardService(
      repo as unknown as DashboardRepository,
    );
    await expect(new DashboardController(service).getStats()).resolves.toEqual({
      totalProducts: 3,
    });
    expect(repo.getStats).toHaveBeenCalledWith(
      LOW_STOCK_THRESHOLD,
      RECENT_ORDERS_LIMIT,
    );
  });
});
