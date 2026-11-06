import type { AppConfig } from '../../config/configuration';
import { CategoriesService } from '../categories/categories.service';
import type { ProductsRepository } from '../products/products.repository';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { buildSitemapXml } from './sitemap.builder';

describe('SEO / sitemap', () => {
  it('buildSitemapXml escapa las URLs y normaliza la base', () => {
    const xml = buildSitemapXml('https://tienda.pe/', [
      { path: '/a?b=1&c=2', changefreq: 'daily', priority: 1 },
    ]);
    expect(xml).toContain('<loc>https://tienda.pe/a?b=1&amp;c=2</loc>');
    expect(xml).toContain('<priority>1.0</priority>');
  });

  it('incluye páginas estáticas, categorías y productos', async () => {
    const products = {
      findAllForSitemap: jest.fn().mockResolvedValue([{ id: 42 }]),
    };
    const service = new SeoService(
      { frontendUrl: 'https://tienda.pe' } as AppConfig,
      new CategoriesService(),
      products as unknown as ProductsRepository,
    );
    const xml = await new SeoController(service).sitemap();
    expect(xml).toContain('https://tienda.pe/destacados');
    expect(xml).toContain('https://tienda.pe/category/tecnologia');
    expect(xml).toContain('https://tienda.pe/product/42');
  });
});
