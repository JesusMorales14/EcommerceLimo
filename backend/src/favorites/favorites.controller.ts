import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtGuard)
export class FavoritesController {
  constructor(private favorites: FavoritesService) {}

  @Get()
  getAll(@Request() req: any) {
    return this.favorites.getUserFavorites(req.user.id);
  }

  @Get('ids')
  getIds(@Request() req: any) {
    return this.favorites.getFavoriteIds(req.user.id);
  }

  @Post(':productId')
  toggle(@Request() req: any, @Param('productId') productId: string) {
    return this.favorites.toggleFavorite(req.user.id, +productId);
  }

  @Delete(':productId')
  remove(@Request() req: any, @Param('productId') productId: string) {
    return this.favorites.toggleFavorite(req.user.id, +productId);
  }
}
