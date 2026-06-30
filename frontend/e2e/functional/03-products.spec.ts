import { test, expect } from '@playwright/test';

test.describe('PF-03: Catálogo de Productos', () => {
  test('PF-03-01: lista la categoría tecnología con productos', async ({ page }) => {
    await page.goto('/category/tecnologia');
    await expect(page.locator('.plp-page')).toBeVisible();
    await page.waitForSelector('.product-card', { timeout: 15_000 });
    const cards = page.locator('.product-card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('PF-03-02: muestra el título de la categoría en el hero', async ({ page }) => {
    await page.goto('/category/tecnologia');
    await expect(page.locator('.cat-hero-title')).toBeVisible();
  });

  test('PF-03-03: muestra el conteo de productos disponibles', async ({ page }) => {
    await page.goto('/category/tecnologia');
    await page.waitForSelector('.cat-hero-count', { timeout: 10_000 });
    await expect(page.locator('.cat-hero-count')).toContainText('productos disponibles');
  });

  test('PF-03-04: selector de ordenamiento cambia el orden de los productos', async ({ page }) => {
    await page.goto('/category/tecnologia');
    await page.waitForSelector('.product-card', { timeout: 15_000 });
    const select = page.locator('.sort-select');
    await expect(select).toBeVisible();
    await select.selectOption('price-asc');
    await expect(page.locator('.product-card').first()).toBeVisible();
  });

  test('PF-03-05: lista la categoría belleza con productos', async ({ page }) => {
    await page.goto('/category/belleza');
    await page.waitForSelector('.product-card', { timeout: 15_000 });
    expect(await page.locator('.product-card').count()).toBeGreaterThan(0);
  });

  test('PF-03-06: la subcategoría laptops muestra sus productos', async ({ page }) => {
    await page.goto('/category/tecnologia/laptops');
    await page.waitForSelector('.product-card', { timeout: 15_000 });
    expect(await page.locator('.product-card').count()).toBeGreaterThan(0);
  });

  test('PF-03-07: hacer clic en un producto navega al detalle', async ({ page }) => {
    await page.goto('/category/tecnologia');
    await page.waitForSelector('.product-card', { timeout: 15_000 });
    await page.locator('.product-card').first().click();
    await expect(page).toHaveURL(/\/product\/\d+/, { timeout: 10_000 });
  });
});
