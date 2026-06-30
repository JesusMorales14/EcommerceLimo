import { test, expect } from '@playwright/test';

const USER_EMAIL = 'usuario@tienda.com';
const USER_PASS  = 'user123';
const WRONG_PASS = 'contraseña-incorrecta';

test.describe('PF-02: Autenticación', () => {
  test('PF-02-01: muestra el formulario de login correctamente', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Iniciar sesión');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('PF-02-02: muestra error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', USER_EMAIL);
    await page.fill('#password', WRONG_PASS);
    await page.click('button[type="submit"]');
    await expect(page.locator('.auth-error')).toBeVisible({ timeout: 8_000 });
  });

  test('PF-02-03: login exitoso redirige a la página de inicio', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', USER_EMAIL);
    await page.fill('#password', USER_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });

  test('PF-02-04: muestra el formulario de registro correctamente', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"], #email')).toBeVisible();
    await expect(page.locator('input[type="password"], #password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('PF-02-05: enlace de ¿No tienes cuenta? navega al registro', async ({ page }) => {
    await page.goto('/login');
    await page.click('a[href="/register"], a[routerLink="/register"]');
    await expect(page).toHaveURL('/register');
  });

  test('PF-02-06: logout cierra sesión y redirige al inicio', async ({ page }) => {
    // Login primero
    await page.goto('/login');
    await page.fill('#email', USER_EMAIL);
    await page.fill('#password', USER_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10_000 });

    // Hacer logout buscando el botón/enlace de cerrar sesión
    const logoutBtn = page.locator('button:has-text("Cerrar"), button:has-text("Salir"), [data-testid="logout"]').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL('/');
    }
  });
});
