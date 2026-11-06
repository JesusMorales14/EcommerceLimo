import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

/** Las categorías cambian poco: se permite caché HTTP de 1 hora. */
const CACHE_ONE_HOUR = 'public, max-age=3600';

@ApiTags('Categorías')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @Header('Cache-Control', CACHE_ONE_HOUR)
  findAll() {
    return this.categories.findAll();
  }
}
