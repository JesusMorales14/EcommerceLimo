import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { DealSessionsService } from './deal-sessions.service';

@Controller('deal-sessions')
export class DealSessionsController {
  constructor(private service: DealSessionsService) {}

  @Get('active')
  getActive() {
    return this.service.getActive();
  }

  @Get('scheduled')
  getScheduled() {
    return this.service.getScheduled();
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Post()
  create(@Body('endsAt') endsAt: string, @Body('startsAt') startsAt?: string) {
    return this.service.create(new Date(endsAt), startsAt ? new Date(startsAt) : undefined);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete('active')
  cancel() {
    return this.service.cancel();
  }
}
