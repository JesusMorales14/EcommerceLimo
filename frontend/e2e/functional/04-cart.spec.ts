import { test, expect } from '@playwright/test';

// El CartService es in-memory (no localStorage). El carrito persiste mientras
// se use Angular Router. La UI principal es el cart drawer (aside.cart-drawer),
// no la página /cart (que queda vacía tras un full page reload).

test.describe('PF-04: Carrito de Compras', () => {
  test('PF-04-01: carrito vacío muestra estado vacío', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-state p')).toContainText('vacío');
  });

  test('PF-04-02: el enlace Volver a la tienda regresa al inicio', async ({ page }) => {
    await page.goto('/cart');
    await page.locator('.empty-state .btn-back').click();
    await expect(page).toHaveURL('/');
  });

  test('PF-04-03: agrega un producto al carrito y el drawer se abre con el item', async ({ page }) => {
    await page.goto('/category/tecnologia');
    await page.waitForSelector('.product-card', { timeout: 15_000 });
    await page.locator('.product-card').first().click();
    await expect(page).toHaveURL(/\/product\/\d+/, { timeout: 10_000 });

    // Esperar a que cargue el producto y el botón esté habilitado
    const addBtn = page.locator('button.btn-buy:not([disabled])').first();
    await addBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await addBtn.click();

    // addToCart() llama cartService.isOpen.set(true) → abre el drawer automáticamente
    await expect(page.locator('.cart-drawer.open')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('.drawer-item').first()).toBeVisible();
  });

  test('PF-04-04: muestra botón de checkout en el drawer cuando hay items', async ({ page }) => {
    await page.goto('/category/tecnologia');
    await page.waitForSelector('.product-card', { timeout: 15_000 });
    await page.locator('.product-card').first().click();

    const addBtn = page.locator('button.btn-buy:not([disabled])').first();
    await addBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await addBtn.click();

    await expect(page.locator('.btn-drawer-checkout')).toBeVisible({ timeout: 5_000 });
  });

  test('PF-04-05: checkout sin sesión redirige a login', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/category/tecnologia');
    await page.waitForSelector('.product-card', { timeout: 15_000 });
    await page.locator('.product-card').first().click();

    const addBtn = page.locator('button.btn-buy:not([disabled])').first();
    await addBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await addBtn.click();

    // El drawer tiene btn-drawer-checkout que usa Angular Router → navega sin reload
    const checkoutBtn = page.locator('.btn-drawer-checkout');
    await checkoutBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await checkoutBtn.click();
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });
});
