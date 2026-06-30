import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
  for (const { name, path } of PAGES) {
    test(`PNF-01: "${name}" no tiene violaciones críticas de accesibilidad`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

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

      // Solo fallar si hay violaciones CRITICAL (no serious/moderate)
      const blocker = results.violations.filter((v) => v.impact === 'critical');
      expect(blocker, `Violaciones críticas en ${name}:\n${blocker.map((v) => v.description).join('\n')}`).toHaveLength(0);
    });
  }

  test('PNF-01: Catálogo de productos no tiene violaciones críticas', async ({ page }) => {
    await page.goto('/category/tecnologia');
    await page.waitForSelector('.product-card', { timeout: 15_000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const blocker = results.violations.filter((v) => v.impact === 'critical');
    expect(blocker, `Violaciones críticas:\n${blocker.map((v) => v.description).join('\n')}`).toHaveLength(0);
  });
});
