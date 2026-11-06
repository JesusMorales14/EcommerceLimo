import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Auth } from '../../common/decorators/auth.decorator';
import { DealSessionsService } from './deal-sessions.service';
import { CreateDealSessionDto } from './dto/create-deal-session.dto';

@ApiTags('Ofertas del Día')
@Controller('deal-sessions')
export class DealSessionsController {
  constructor(private readonly sessions: DealSessionsService) {}

  @Get('active')
  getActive() {
    return this.sessions.getActive();
  }

  @Get('scheduled')
  getScheduled() {
    return this.sessions.getScheduled();
  }

  @Auth(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateDealSessionDto) {
    return this.sessions.create(dto);
  }

  @Auth(Role.ADMIN)
  @Delete('active')
  cancel() {
    return this.sessions.cancel();
  }
}
