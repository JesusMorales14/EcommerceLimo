import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private coupons: CouponsService) {}

  @Get('validate')
  validate(@Query('code') code: string, @Query('amount') amount: string) {
    return this.coupons.validate(code, +amount);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Get()
  findAll() {
    return this.coupons.findAll();
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Post()
  create(@Body() body: {
    code: string;
    discount: number;
    isPercent: boolean;
    minAmount: number;
    maxUses: number;
    expiresAt?: string;
  }) {
    return this.coupons.create(body);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.coupons.toggle(+id);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coupons.remove(+id);
  }
}
