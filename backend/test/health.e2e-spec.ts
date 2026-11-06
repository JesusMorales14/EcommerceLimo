import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/create-test-app';

describe('Health & SEO (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(() => app.close());

  it('GET /health confirma la conexión a la base de datos', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toEqual({ status: 'ok', database: 'up' });
  });

  it('aplica cabeceras de seguridad (helmet)', async () => {
    const res = await request(app.getHttpServer())
      .get('/health/live')
      .expect(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('GET /sitemap.xml devuelve un sitemap válido', async () => {
    const res = await request(app.getHttpServer())
      .get('/sitemap.xml')
      .expect(200);
    expect(res.headers['content-type']).toContain('application/xml');
    expect(res.text).toContain('<urlset');
  });
});
