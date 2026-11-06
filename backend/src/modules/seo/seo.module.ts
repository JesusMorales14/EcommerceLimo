import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';

@Module({
  imports: [CategoriesModule, ProductsModule],
  controllers: [SeoController],
  providers: [SeoService],
})
export class SeoModule {}
