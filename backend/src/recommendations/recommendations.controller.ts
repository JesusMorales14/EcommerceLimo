import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private service: RecommendationsService) {}

  //trending
  @Get('top')
  getTop() {
    return this.service.getTopProducts();
  }

  //similares
  @Get('product/:id')
  similar(@Param('id') id: string) {
    return this.service.similarProducts(Number(id));
  }

  //por usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('me')
  forUser(@Req() req) {
    return this.service.forUser(req.user.userId);
  }
}
