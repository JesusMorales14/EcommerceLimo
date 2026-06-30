import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const testEmail = `e2e-test-${Date.now()}@ecommercelimo.com`;
  const testPassword = 'Password123';
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { email: testEmail } }).catch(() => undefined);
    await app.close();
  });

  it('POST /auth/register crea un usuario nuevo y retorna token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Usuario E2E',
        email: testEmail,
        password: testPassword,
      })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({ email: testEmail, name: 'Usuario E2E' });
  });

  it('POST /auth/register falla con email duplicado', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Usuario Duplicado',
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(409);
  });

  it('POST /auth/login con credenciales correctas retorna token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    token = res.body.token;
  });

  it('POST /auth/login con contraseña incorrecta retorna 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: 'PasswordIncorrecta' })
      .expect(401);
  });

  it('GET /auth/me con token válido retorna los datos del usuario', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toMatchObject({ email: testEmail, name: 'Usuario E2E' });
  });

  it('GET /auth/me sin token retorna 401', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
