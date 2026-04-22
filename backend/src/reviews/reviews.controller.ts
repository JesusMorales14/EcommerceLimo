import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private service: ReviewsService) {}

  // ⭐ crear review (protegido)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() body) {
    return this.service.create(
      req.user.userId,
      body.productId,
      body.rating,
      body.comment,
    );
  }

  // 📦 ver reviews por producto
  @Get('product/:id')
  getByProduct(@Param('id') id: string) {
    return this.service.getByProduct(Number(id));
  }

  // ⭐ promedio
  @Get('product/:id/avg')
  getAvg(@Param('id') id: string) {
    return this.service.getAverageRating(Number(id));
  }
}
