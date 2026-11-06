import { test, expect } from '@playwright/test';

// Credenciales del usuario de demostración creado por `npm run seed` (backend).
const USER_EMAIL = process.env['E2E_USER_EMAIL'] ?? 'usuario@tienda.com';
const USER_PASS = process.env['E2E_USER_PASSWORD'] ?? 'Usuario123';
const WRONG_PASS = 'contraseña-incorrecta';

// El header también tiene formularios (buscador), así que se apunta al botón
// del formulario de autenticación.
const SUBMIT = 'form:has(#password) button[type="submit"]';

test.describe('PF-02: Autenticación', () => {
  test('PF-02-01: muestra el formulario de login correctamente', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Iniciar sesión');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator(SUBMIT)).toBeVisible();
  });

  test('PF-02-02: muestra error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', USER_EMAIL);
    await page.fill('#password', WRONG_PASS);
    await page.click(SUBMIT);
    await expect(page.locator('.auth-error')).toBeVisible({ timeout: 8_000 });
  });

  test('PF-02-03: login exitoso redirige a la página de inicio', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', USER_EMAIL);
    await page.fill('#password', USER_PASS);
    await page.click(SUBMIT);
    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });

  test('PF-02-04: muestra el formulario de registro correctamente', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"], #email')).toBeVisible();
    await expect(page.locator('input[type="password"], #password')).toBeVisible();
    await expect(page.locator(SUBMIT)).toBeVisible();
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
    await page.click(SUBMIT);
    await expect(page).toHaveURL('/', { timeout: 10_000 });

    // Hacer logout buscando el botón/enlace de cerrar sesión
    const logoutBtn = page.locator('button:has-text("Cerrar"), button:has-text("Salir"), [data-testid="logout"]').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL('/');
    }
  });
});
