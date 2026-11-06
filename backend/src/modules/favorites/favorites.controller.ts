import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { FavoritesService } from './favorites.service';

@ApiTags('Favoritos')
@Auth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  getAll(@CurrentUser() user: AuthenticatedUser) {
    return this.favorites.getProducts(user.id);
  }

  @Get('ids')
  getIds(@CurrentUser() user: AuthenticatedUser) {
    return this.favorites.getProductIds(user.id);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Agrega o quita el producto de favoritos (toggle)' })
  toggle(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.favorites.toggle(user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Quita el producto de favoritos (idempotente)' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.favorites.remove(user.id, productId);
  }
}
