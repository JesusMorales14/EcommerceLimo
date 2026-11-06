import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('Pedidos')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Auth()
  @Post()
  @ApiOperation({
    summary: 'Crea un pedido (reserva stock y aplica cupón de forma atómica)',
  })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrderDto) {
    return this.orders.createOrder(user.id, dto);
  }

  @Auth()
  @Get('mine')
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.orders.getUserOrders(user.id);
  }

  @Auth(Role.ADMIN)
  @Get('all')
  all() {
    return this.orders.getAllOrders();
  }

  @Auth(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.orders.updateStatus(id, dto);
  }
}
