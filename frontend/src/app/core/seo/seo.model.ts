/** Metadatos SEO que una ruta puede declarar en `data.seo`. */
export interface RouteSeoData {
  /** Meta description (≈150-160 caracteres). */
  readonly description?: string;
  /** Si es `true` se emite `noindex, nofollow` (páginas privadas o transaccionales). */
  readonly noIndex?: boolean;
}

/** Metadatos completos aplicados a una página. */
export interface PageSeo extends RouteSeoData {
  readonly title: string;
  readonly image?: string;
  readonly type?: 'website' | 'product' | 'article';
  /** Ruta canónica relativa (por defecto la URL actual sin query params). */
  readonly path?: string;
}

/** Objeto JSON-LD (schema.org). */
export type JsonLd = Record<string, unknown>;
