import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Auth } from '../../common/decorators/auth.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Panel de administración')
@Auth(Role.ADMIN)
@Controller('admin')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary:
      'Métricas: productos, stock bajo, pedidos, ingresos y pedidos recientes',
  })
  getStats() {
    return this.dashboard.getStats();
  }
}
