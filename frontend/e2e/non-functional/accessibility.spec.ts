import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Espera a que terminen las animaciones de entrada para evaluar el estado final. */
async function waitForAnimations(page: Page): Promise<void> {
  await page
    .waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'), undefined, { timeout: 5_000 })
    .catch(() => undefined);
}

const PAGES = [
  { name: 'Inicio',           path: '/' },
  { name: 'Login',            path: '/login' },
  { name: 'Registro',         path: '/register' },
  { name: 'Carrito',          path: '/cart' },
  { name: 'Política de Envío', path: '/politica-envio' },
  { name: 'Términos',         path: '/terminos' },
  { name: 'Centro de Ayuda',  path: '/centro-ayuda' },
];

test.describe('PNF-01: Accesibilidad WCAG 2.1 (axe-core)', () => {
  // Sin animaciones: axe evalúa el estado final (no colores a mitad de un fade-in).
  test.use({ reducedMotion: 'reduce' });

  for (const { name, path } of PAGES) {
    test(`PNF-01: "${name}" no tiene violaciones críticas de accesibilidad`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
      await waitForAnimations(page);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('.material-symbols-outlined') // icon font no afecta a11y real
        .analyze();

      // Filtrar violaciones críticas (serious / critical)
      const critical = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );

      if (critical.length > 0) {
        const summary = critical.map((v) =>
          `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description} (${v.nodes.length} nodo(s))`,
        ).join('\n');
        console.warn(`⚠️  Violaciones en "${name}":\n${summary}`);
      }

      // WCAG 2.1 AA: no se aceptan violaciones serias ni críticas
      expect(critical, `Violaciones de accesibilidad en ${name}:\n${critical.map((v) => v.description).join('\n')}`).toHaveLength(0);
    });
  }

  test('PNF-01: Catálogo de productos no tiene violaciones críticas', async ({ page }) => {
    await page.goto('/category/tecnologia');
    await page.waitForSelector('.product-card', { timeout: 15_000 });
    await waitForAnimations(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const blocker = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(blocker, `Violaciones de accesibilidad:\n${blocker.map((v) => v.description).join('\n')}`).toHaveLength(0);
  });
});
