import { Controller, Get, Post, Body } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart() {
    return this.cartService.getCart();
  }

  @Post('add')
  add(@Body() dto: AddItemDto) {
    return this.cartService.addItem(dto.productId);
  }
}
