import { buildCorsOrigin } from './app.setup';

describe('buildCorsOrigin', () => {
  const check = (allowed: string[], origin?: string) =>
    new Promise<boolean | undefined>((resolve) =>
      buildCorsOrigin(allowed)(origin, (_e, allow) => resolve(allow)),
    );

  it('permite orígenes exactos y peticiones sin origen (server-to-server)', async () => {
    await expect(
      check(['http://localhost:4200'], 'http://localhost:4200'),
    ).resolves.toBe(true);
    await expect(check(['http://localhost:4200'])).resolves.toBe(true);
  });

  it('soporta comodines de subdominio', async () => {
    await expect(
      check(['https://*.vercel.app'], 'https://mi-preview-123.vercel.app'),
    ).resolves.toBe(true);
    await expect(
      check(['https://*.vercel.app'], 'https://vercel.app.evil.com'),
    ).resolves.toBe(false);
  });

  it('rechaza orígenes no permitidos', async () => {
    await expect(
      check(['http://localhost:4200'], 'https://malicioso.com'),
    ).resolves.toBe(false);
  });
});
