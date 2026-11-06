import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE_CONFIG } from '@core/config/site.config';
import { environment } from '@env/environment';
import type { JsonLd, PageSeo } from './seo.model';

const JSON_LD_SCRIPT_ID = 'app-json-ld';

/**
 * Centraliza la gestión de metadatos SEO (title, description, Open Graph,
 * Twitter Cards, canonical, robots y datos estructurados JSON-LD).
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  /** Construye el título final con el sufijo de la tienda. */
  buildTitle(pageTitle?: string): string {
    return pageTitle ? `${pageTitle} | ${SITE_CONFIG.storeName}` : SITE_CONFIG.storeName;
  }

  /** Aplica todos los metadatos de una página. */
  update(seo: PageSeo): void {
    const fullTitle = this.buildTitle(seo.title);
    const description = seo.description ?? SITE_CONFIG.defaultDescription;
    const url = this.absoluteUrl(seo.path ?? this.currentPath());
    const image = seo.image ?? this.absoluteUrl(SITE_CONFIG.defaultImage);

    this.title.setTitle(fullTitle);
    this.setName('description', description);
    this.setName('robots', seo.noIndex ? 'noindex, nofollow' : 'index, follow');

    this.setProperty('og:title', fullTitle);
    this.setProperty('og:description', description);
    this.setProperty('og:type', seo.type ?? 'website');
    this.setProperty('og:url', url);
    this.setProperty('og:image', image);
    this.setProperty('og:site_name', SITE_CONFIG.storeName);
    this.setProperty('og:locale', SITE_CONFIG.locale);

    this.setName('twitter:card', 'summary_large_image');
    this.setName('twitter:title', fullTitle);
    this.setName('twitter:description', description);
    this.setName('twitter:image', image);

    this.setCanonical(url);
  }

  /** Inserta (o reemplaza) el bloque JSON-LD de la página. Pasar `null` lo elimina. */
  setJsonLd(data: JsonLd | null): void {
    this.document.getElementById(JSON_LD_SCRIPT_ID)?.remove();
    if (!data) return;
    const script = this.document.createElement('script');
    script.id = JSON_LD_SCRIPT_ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  private setName(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }

  private currentPath(): string {
    return this.document.location?.pathname ?? '/';
  }

  private absoluteUrl(path: string): string {
    if (/^https?:\/\//.test(path)) return path;
    const base = environment.siteUrl.replace(/\/$/, '');
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
