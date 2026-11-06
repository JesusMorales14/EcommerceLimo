import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

/** Endpoints de salud para orquestadores (Docker, Render, Kubernetes) y monitoreo. */
@ApiTags('Salud')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness: el proceso responde' })
  live() {
    return { status: 'ok', uptime: Math.round(process.uptime()) };
  }

  @Get()
  @ApiOperation({ summary: 'Readiness: la base de datos está disponible' })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'up' };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'down',
      });
    }
  }
}
