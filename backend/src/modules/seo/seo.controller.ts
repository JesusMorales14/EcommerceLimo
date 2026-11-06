import { Controller, Get, Header } from '@nestjs/common';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { SeoService } from './seo.service';

@ApiTags('SEO')
@Controller()
export class SeoController {
  constructor(private readonly seo: SeoService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiProduces('application/xml')
  sitemap() {
    return this.seo.buildSitemap();
  }
}
