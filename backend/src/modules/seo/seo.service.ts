import { Inject, Injectable } from '@nestjs/common';
import { APP_CONFIG } from '../../config/app-config.token';
import type { AppConfig } from '../../config/configuration';
import { CategoriesService } from '../categories/categories.service';
import { ProductsRepository } from '../products/products.repository';
import { buildSitemapXml, type SitemapEntry } from './sitemap.builder';

const STATIC_PAGES: readonly SitemapEntry[] = [
  { path: '/', changefreq: 'daily', priority: 1 },
  { path: '/destacados', changefreq: 'daily', priority: 0.8 },
  { path: '/centro-ayuda', changefreq: 'monthly', priority: 0.4 },
  { path: '/politica-envio', changefreq: 'yearly', priority: 0.3 },
  { path: '/terminos', changefreq: 'yearly', priority: 0.2 },
  { path: '/privacidad', changefreq: 'yearly', priority: 0.2 },
  { path: '/reclamaciones', changefreq: 'yearly', priority: 0.2 },
];

/** Genera el sitemap dinámico del frontend (páginas, categorías y productos). */
@Injectable()
export class SeoService {
  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly categories: CategoriesService,
    private readonly products: ProductsRepository,
  ) {}

  async buildSitemap(): Promise<string> {
    const categories: SitemapEntry[] = this.categories
      .findAll()
      .flatMap((category) => [
        {
          path: `/category/${category.id}`,
          changefreq: 'daily' as const,
          priority: 0.7,
        },
        ...category.subCategories.map((sub) => ({
          path: `/category/${category.id}/${sub.id}`,
          changefreq: 'weekly' as const,
          priority: 0.6,
        })),
      ]);
    const products: SitemapEntry[] = (
      await this.products.findAllForSitemap()
    ).map(({ id }) => ({
      path: `/product/${id}`,
      changefreq: 'weekly',
      priority: 0.5,
    }));
    return buildSitemapXml(this.config.frontendUrl, [
      ...STATIC_PAGES,
      ...categories,
      ...products,
    ]);
  }
}
