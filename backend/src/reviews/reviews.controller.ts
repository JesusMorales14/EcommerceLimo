import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { ReviewsService } from './reviews.service';

interface JwtRequest {
  user: { id: number; role: string };
}

@Controller('reviews')
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Get('product/:productId')
  getByProduct(@Param('productId') productId: string) {
    return this.reviews.getByProduct(+productId);
  }

  @Get('product/:productId/stats')
  getStats(@Param('productId') productId: string) {
    return this.reviews.getStats(+productId);
  }

  @UseGuards(JwtGuard)
  @Post('product/:productId')
  create(
    @Request() req: JwtRequest,
    @Param('productId') productId: string,
    @Body() body: { rating: number; comment: string },
  ) {
    return this.reviews.create(
      req.user.id,
      +productId,
      body.rating,
      body.comment,
    );
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Request() req: JwtRequest, @Param('id') id: string) {
    return this.reviews.remove(req.user.id, +id, req.user.role === 'ADMIN');
  }
}
