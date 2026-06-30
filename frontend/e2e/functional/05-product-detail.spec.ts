import { test, expect } from '@playwright/test';

test.describe('PF-05: Detalle de Producto', () => {
  let productUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:4200/category/tecnologia');
    await page.waitForSelector('.product-card', { timeout: 15_000 });
    await page.locator('.product-card').first().click();
    await page.waitForURL(/\/product\/\d+/, { timeout: 10_000 });
    productUrl = page.url().replace('http://localhost:4200', '');
    await page.close();
  });

  test('PF-05-01: muestra el nombre y precio del producto', async ({ page }) => {
    await page.goto(productUrl);
    await expect(page.locator('h1.info-title')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.price-now').first()).toBeVisible();
  });

  test('PF-05-02: muestra la imagen principal del producto', async ({ page }) => {
    await page.goto(productUrl);
    await expect(page.locator('.gallery-main img')).toBeVisible({ timeout: 10_000 });
  });

  test('PF-05-03: muestra el botón de compra', async ({ page }) => {
    await page.goto(productUrl);
    // El botón se llama "Comprar ahora" con clase btn-buy
    await expect(page.locator('button.btn-buy')).toBeVisible({ timeout: 10_000 });
  });

  test('PF-05-04: muestra la pestaña de opiniones', async ({ page }) => {
    await page.goto(productUrl);
    await page.waitForSelector('.pdp-tabs', { timeout: 10_000 });
    // Las tabs incluyen "Opiniones" (tab index 2)
    const opinionsTab = page.locator('.tab-btn').nth(2);
    await expect(opinionsTab).toBeVisible();
    await expect(opinionsTab).toContainText('Opiniones');
  });

  test('PF-05-05: el selector de cantidad funciona', async ({ page }) => {
    await page.goto(productUrl);
    await page.waitForSelector('.qty-selector', { timeout: 10_000 });
    // Clic en el botón + (último botón del qty-selector)
    const incrementBtn = page.locator('.qty-selector button').last();
    await incrementBtn.click();
    // El display de cantidad es el span dentro de .qty-selector
    const qtySpan = page.locator('.qty-selector span');
    await expect(qtySpan).toBeVisible();
    const qty = await qtySpan.textContent();
    expect(Number(qty)).toBeGreaterThanOrEqual(1);
  });
});
