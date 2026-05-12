import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  getAll(
    @Query('category') category?: string,
    @Query('subCategory') subCategory?: string,
    @Query('isOffer') isOffer?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.products.findAll(
      category,
      subCategory,
      isOffer !== undefined ? isOffer === 'true' : undefined,
      search,
      page ? +page : 1,
      limit ? +limit : 40,
    );
  }

  @Get('stats')
  @UseGuards(JwtGuard, AdminGuard)
  getStats() {
    return this.products.getStats();
  }

  @Get(':id')
  getById(@Param('id') id: string) { return this.products.findOne(+id); }

  @UseGuards(JwtGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreateProductDto) { return this.products.create(dto); }

  @UseGuards(JwtGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) { return this.products.update(+id, dto); }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) { return this.products.remove(+id); }
}
