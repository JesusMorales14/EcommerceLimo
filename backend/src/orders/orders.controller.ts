import { Controller, Get, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Get()
  getAll() {
    return this.service.getOrders();
  }

  @Post()
  create(@Body() body: CreateOrderDto) {
    return this.service.createOrder(body);
  }
}
