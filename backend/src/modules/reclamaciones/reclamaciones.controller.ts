import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CreateReclamacionDto } from './dto/create-reclamacion.dto';
import { UpdateReclamacionDto } from './dto/update-reclamacion.dto';
import { ReclamacionesService } from './reclamaciones.service';

@ApiTags('Libro de Reclamaciones')
@Controller('reclamaciones')
export class ReclamacionesController {
  constructor(private readonly claims: ReclamacionesService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Registra una reclamación (no requiere sesión)' })
  create(
    @Body() dto: CreateReclamacionDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.claims.create(dto, user?.id);
  }

  @Auth()
  @Get('mine')
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.claims.findByUser(user.id);
  }

  @Auth(Role.ADMIN)
  @Get('all')
  all() {
    return this.claims.findAll();
  }

  @Auth(Role.ADMIN)
  @Patch(':id/estado')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReclamacionDto,
  ) {
    return this.claims.updateStatus(id, dto);
  }
}
