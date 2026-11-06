import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Auth } from '../../common/decorators/auth.decorator';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponQueryDto } from './dto/validate-coupon.dto';

@ApiTags('Cupones')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Get('validate')
  @ApiOperation({
    summary: 'Valida un cupón y calcula el descuento para un monto',
  })
  async validate(@Query() { code, amount }: ValidateCouponQueryDto) {
    const { id: _id, ...quote } = await this.coupons.quote(code, amount);
    return quote;
  }

  @Auth(Role.ADMIN)
  @Get()
  findAll() {
    return this.coupons.findAll();
  }

  @Auth(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateCouponDto) {
    return this.coupons.create(dto);
  }

  @Auth(Role.ADMIN)
  @Patch(':id/toggle')
  toggle(@Param('id', ParseIntPipe) id: number) {
    return this.coupons.toggle(id);
  }

  @Auth(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coupons.remove(id);
  }
}
