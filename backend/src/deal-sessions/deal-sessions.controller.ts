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

  @UseGuards(JwtGuard, AdminGuard)
  @Post()
  create(@Body('endsAt') endsAt: string) {
    return this.service.create(new Date(endsAt));
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete('active')
  cancel() {
    return this.service.cancel();
  }
}
