import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import { CreateReclamacionDto } from './dto/create-reclamacion.dto';
import { UpdateReclamacionDto } from './dto/update-reclamacion.dto';
import { ReclamacionesService } from './reclamaciones.service';

@Controller('reclamaciones')
export class ReclamacionesController {
  constructor(private service: ReclamacionesService) {}

  @UseGuards(OptionalJwtGuard)
  @Post()
  create(@Body() dto: CreateReclamacionDto, @Request() req: any) {
    return this.service.create(dto, req.user?.id);
  }

  @UseGuards(JwtGuard)
  @Get('mine')
  mine(@Request() req: any) {
    return this.service.findByUser(req.user.id);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Get('all')
  all() {
    return this.service.findAll();
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body() dto: UpdateReclamacionDto) {
    return this.service.updateEstado(+id, dto);
  }
}
