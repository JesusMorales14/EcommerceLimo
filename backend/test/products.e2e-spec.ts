import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /products retorna items y total, con productos sembrados', async () => {
    const res = await request(app.getHttpServer()).get('/products').expect(200);

    expect(Array.isArray(res.body.items)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('GET /products?category=<x> retorna solo productos de esa categoría', async () => {
    const all = await request(app.getHttpServer()).get('/products').expect(200);
    const category = all.body.items[0].category;

    const res = await request(app.getHttpServer())
      .get('/products')
      .query({ category })
      .expect(200);

    expect(res.body.items.length).toBeGreaterThan(0);
    for (const item of res.body.items) {
      expect(item.category).toBe(category);
    }
  });

  it('GET /products/:id retorna el producto cuando el id existe', async () => {
    const all = await request(app.getHttpServer()).get('/products').expect(200);
    const firstId = all.body.items[0].id;

    const res = await request(app.getHttpServer())
      .get(`/products/${firstId}`)
      .expect(200);

    expect(res.body.id).toBe(firstId);
  });

  it('GET /products/999999 (id inexistente) retorna 404', async () => {
    await request(app.getHttpServer()).get('/products/999999').expect(404);
  });
});
