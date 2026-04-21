import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  // 🔐 SOLO USUARIO LOGUEADO
  @UseGuards(JwtAuthGuard)
  @Get()
  getMyOrders(@Req() req) {
    return this.service.getByUser(req.user.userId);
  }

  // 🔐 CREAR ORDEN CON USUARIO AUTENTICADO
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() body: CreateOrderDto) {
    return this.service.createOrder(req.user.userId, body);
  }
}
