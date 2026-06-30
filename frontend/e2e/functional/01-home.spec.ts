import { test, expect } from '@playwright/test';

test.describe('PF-01: Página de Inicio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('PF-01-01: carga y muestra el hero con título principal', async ({ page }) => {
    await expect(page.locator('.hero h1')).toBeVisible();
    await expect(page.locator('.hero h1')).toContainText('Revive tu espacio');
  });

  test('PF-01-02: muestra el botón Ver Colección en el hero', async ({ page }) => {
    const btn = page.locator('.hero .btn-fill');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText('Ver Colección');
  });

  test('PF-01-03: navega a la categoría hogar al hacer clic en Ver Colección', async ({ page }) => {
    await page.locator('.hero .btn-fill').click();
    await expect(page).toHaveURL(/\/category\/hogar/);
  });

  test('PF-01-04: muestra la sección de Productos Destacados', async ({ page }) => {
    // La sección siempre se renderiza (los productos cargan asincrónicamente)
    const section = page.locator('.section-block h2:has-text("Productos Destacados")');
    await expect(section).toBeVisible({ timeout: 10_000 });
  });

  test('PF-01-05: tiene el botón del carrito en la cabecera', async ({ page }) => {
    // El carrito en el header es un button.cart-btn (abre el drawer lateral)
    const cartBtn = page.locator('.cart-btn').first();
    await expect(cartBtn).toBeVisible();
  });
});
