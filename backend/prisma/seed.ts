/**
 * Carga datos de demostración (usuarios y catálogo).
 *
 * ⚠️ Borra pedidos y productos existentes: por seguridad no se ejecuta en
 * producción salvo que se defina SEED_ALLOW_RESET=true.
 * Las contraseñas se leen de SEED_ADMIN_PASSWORD / SEED_USER_PASSWORD.
 */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PRODUCTS } from './seed-data/index';

const BCRYPT_ROUNDS = 10;
const isProduction = process.env.NODE_ENV === 'production';

const prisma = new PrismaClient();

function requirePassword(variable: string, devFallback: string): string {
  const value = process.env[variable];
  if (value) return value;
  if (isProduction) {
    throw new Error(`Define ${variable} para ejecutar el seed en producción`);
  }
  return devFallback;
}

async function upsertUser(
  email: string,
  name: string,
  role: Role,
  plainPassword: string,
  phone?: string,
): Promise<void> {
  const password = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { email },
    update: { password },
    create: { email, name, role, password, phone },
  });
}

async function seedUsers(): Promise<void> {
  await upsertUser(
    'admin@tienda.com',
    'Administrador',
    Role.ADMIN,
    requirePassword('SEED_ADMIN_PASSWORD', 'Admin123456'),
  );
  await upsertUser(
    'usuario@tienda.com',
    'Usuario Demo',
    Role.USER,
    requirePassword('SEED_USER_PASSWORD', 'Usuario123'),
    '+51987654321',
  );
  console.info('✔ Usuarios de demostración listos');
}

async function seedProducts(): Promise<void> {
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.product.createMany({ data: PRODUCTS }),
  ]);
  console.info(`✔ ${PRODUCTS.length} productos creados`);
}

async function main(): Promise<void> {
  if (isProduction && process.env.SEED_ALLOW_RESET !== 'true') {
    throw new Error(
      'Seed bloqueado en producción (define SEED_ALLOW_RESET=true)',
    );
  }
  await seedUsers();
  await seedProducts();
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
