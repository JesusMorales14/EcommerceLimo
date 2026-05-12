import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { FavoritesModule } from './favorites/favorites.module';
import { MailModule } from './mail/mail.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CouponsModule } from './coupons/coupons.module';
import { DealSessionsModule } from './deal-sessions/deal-sessions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    FavoritesModule,
    PaymentsModule,
    ReviewsModule,
    CouponsModule,
    DealSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
