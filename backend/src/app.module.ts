import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppConfigModule } from './config/app-config.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DealSessionsModule } from './modules/deal-sessions/deal-sessions.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { HealthModule } from './modules/health/health.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductsModule } from './modules/products/products.module';
import { ReclamacionesModule } from './modules/reclamaciones/reclamaciones.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SeoModule } from './modules/seo/seo.module';
import { UsersModule } from './modules/users/users.module';

/** Límite global de peticiones por IP (protección básica contra abuso). */
const RATE_LIMIT = { ttl: 60_000, limit: 120 };

@Module({
  imports: [
    // Infraestructura transversal
    AppConfigModule,
    PrismaModule,
    MailModule,
    ThrottlerModule.forRoot([RATE_LIMIT]),
    // Módulos de dominio
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CouponsModule,
    FavoritesModule,
    ReviewsModule,
    DealSessionsModule,
    ReclamacionesModule,
    PaymentsModule,
    DashboardModule,
    SeoModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
