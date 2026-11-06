export interface SitemapEntry {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
}

const xmlEscape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Genera el XML de un sitemap (protocolo sitemaps.org) para las URLs indicadas. */
export function buildSitemapXml(
  baseUrl: string,
  entries: readonly SitemapEntry[],
): string {
  const base = baseUrl.replace(/\/$/, '');
  const urls = entries
    .map(
      ({ path, changefreq, priority }) =>
        `  <url><loc>${xmlEscape(base + path)}</loc><changefreq>${changefreq}</changefreq><priority>${priority.toFixed(1)}</priority></url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
