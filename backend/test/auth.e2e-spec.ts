import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { createTestApp } from './utils/create-test-app';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmail = `e2e-test-${Date.now()}@ecommercelimo.com`;
  const testPassword = 'Password123';
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user
      .delete({ where: { email: testEmail } })
      .catch(() => undefined);
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
    expect(res.body.user).toMatchObject({
      email: testEmail,
      name: 'Usuario E2E',
    });
  });

  it('POST /auth/register falla con email duplicado', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
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
      .expect(200);

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

  it('PATCH /auth/profile rechaza campos no permitidos (evita escalar a ADMIN)', async () => {
    await request(app.getHttpServer())
      .patch('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nuevo Nombre', role: 'ADMIN' })
      .expect(400);
  });

  it('PATCH /auth/profile actualiza los campos permitidos', async () => {
    const res = await request(app.getHttpServer())
      .patch('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nuevo Nombre' })
      .expect(200);
    expect(res.body).toMatchObject({ name: 'Nuevo Nombre', role: 'USER' });
    expect(res.body).not.toHaveProperty('password');
  });

  it('POST /auth/register valida los datos de entrada', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'X', email: 'no-es-correo', password: '1' })
      .expect(400);
    expect(Array.isArray(res.body.message)).toBe(true);
  });
});
