import { test, expect } from '@playwright/test';

// Umbrales de rendimiento (ms) — basados en Core Web Vitals
const THRESHOLDS = {
  domContentLoaded: 3_000,   // DCL < 3s
  load:             5_000,   // Load < 5s
  fcp:              2_500,   // First Contentful Paint < 2.5s
  apiResponse:      2_000,   // Tiempo de respuesta API < 2s
};

interface NavTiming {
  domContentLoadedEventEnd: number;
  loadEventEnd: number;
  startTime: number;
}

interface PaintEntry {
  name: string;
  startTime: number;
}

async function getTimings(page: import('@playwright/test').Page): Promise<{
  dcl: number;
  load: number;
  fcp: number;
}> {
  return page.evaluate((): { dcl: number; load: number; fcp: number } => {
    const nav = performance.getEntriesByType('navigation')[0] as unknown as NavTiming;
    const ref = nav.startTime ?? 0;
    const paints = performance.getEntriesByType('paint') as unknown as PaintEntry[];
    const fcpEntry = paints.find((e) => e.name === 'first-contentful-paint');

    return {
      dcl:  Math.max(0, (nav.domContentLoadedEventEnd - ref) || 0),
      load: Math.max(0, (nav.loadEventEnd - ref) || 0),
      fcp:  fcpEntry ? fcpEntry.startTime : 0,
    };
  });
}

test.describe('PNF-02: Rendimiento de Carga de Páginas', () => {
  test('PNF-02-01: Página de Inicio carga en tiempo aceptable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    const t = await getTimings(page);

    console.log(`[Inicio] DCL=${t.dcl.toFixed(0)}ms | Load=${t.load.toFixed(0)}ms | FCP=${t.fcp.toFixed(0)}ms`);

    expect(t.dcl,  `DCL demasiado lento: ${t.dcl.toFixed(0)}ms`).toBeLessThan(THRESHOLDS.domContentLoaded);
    expect(t.load, `Load demasiado lento: ${t.load.toFixed(0)}ms`).toBeLessThan(THRESHOLDS.load);
    expect(t.fcp,  `FCP demasiado lento: ${t.fcp.toFixed(0)}ms`).toBeLessThan(THRESHOLDS.fcp);
  });

  test('PNF-02-02: Página de Login carga en tiempo aceptable', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('load');
    const t = await getTimings(page);

    console.log(`[Login] DCL=${t.dcl.toFixed(0)}ms | Load=${t.load.toFixed(0)}ms | FCP=${t.fcp.toFixed(0)}ms`);

    expect(t.dcl).toBeLessThan(THRESHOLDS.domContentLoaded);
    expect(t.load).toBeLessThan(THRESHOLDS.load);
  });

  test('PNF-02-03: Catálogo de productos carga en tiempo aceptable', async ({ page }) => {
    await page.goto('/category/tecnologia');
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    const t = await getTimings(page);

    console.log(`[Catálogo] DCL=${t.dcl.toFixed(0)}ms | Load=${t.load.toFixed(0)}ms | FCP=${t.fcp.toFixed(0)}ms`);

    expect(t.dcl).toBeLessThan(THRESHOLDS.domContentLoaded);
    expect(t.load).toBeLessThan(THRESHOLDS.load);
  });

  test('PNF-02-04: Carrito carga en tiempo aceptable', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('load');
    const t = await getTimings(page);

    console.log(`[Carrito] DCL=${t.dcl.toFixed(0)}ms | Load=${t.load.toFixed(0)}ms | FCP=${t.fcp.toFixed(0)}ms`);

    expect(t.dcl).toBeLessThan(THRESHOLDS.domContentLoaded);
    expect(t.load).toBeLessThan(THRESHOLDS.load);
  });

  test('PNF-02-05: tiempo de respuesta de la API de productos < 2s', async ({ page }) => {
    await page.goto('/category/tecnologia');
    await page.waitForSelector('.product-card', { timeout: 15_000 });

    // Medir via Performance Resource Timing API (más fiable que Response.timing())
    const apiDuration = await page.evaluate((): number => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const entry = entries.find((e) => e.name.includes('/products'));
      return entry ? entry.duration : 0;
    });

    if (apiDuration > 0) {
      console.log(`[API /products] duración: ${apiDuration.toFixed(0)}ms`);
      expect(apiDuration, `API /products tardó demasiado: ${apiDuration.toFixed(0)}ms`).toBeLessThan(THRESHOLDS.apiResponse);
    } else {
      console.log('[API /products] no se encontró entrada de timing (puede estar cacheada)');
    }
  });

  test('PNF-02-06: los bundles JS de la app no superan 1MB cada uno', async ({ page }) => {
    const heavyBundles: string[] = [];

    page.on('response', async (res) => {
      // Solo revisar recursos propios de localhost (excluir CDNs y fuentes externas)
      if (!res.url().includes('localhost:4200')) return;
      if (!res.url().endsWith('.js') && !res.url().endsWith('.mjs')) return;

      const contentLength = res.headers()['content-length'];
      if (contentLength && parseInt(contentLength) > 1_048_576) {
        heavyBundles.push(`${res.url().split('/').pop()} (${(parseInt(contentLength) / 1024).toFixed(0)} KB)`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('load');

    if (heavyBundles.length > 0) {
      console.warn(`Bundles JS > 1MB: ${heavyBundles.join(', ')}`);
    }
    expect(heavyBundles, `Bundles JS propios demasiado grandes:\n${heavyBundles.join('\n')}`).toHaveLength(0);
  });
});
