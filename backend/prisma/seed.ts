import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PRODUCTS } from './seed-data/index';

const prisma = new PrismaClient();

async function seedUsers() {
  const adminPwd = await bcrypt.hash('ASDF123456asdf123456', 10);
  await prisma.user.upsert({
    where:  { email: 'admin@tienda.com' },
    update: { password: adminPwd },
    create: { name: 'Administrador', email: 'admin@tienda.com', password: adminPwd, role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where:  { email: 'usuario@tienda.com' },
    update: {},
    create: {
      name: 'Usuario Demo', email: 'usuario@tienda.com',
      password: await bcrypt.hash('user123', 10),
      role: 'USER', phone: '+56912345678',
    },
  });

  console.log('Usuarios creados');
}

async function seedProducts() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.product.createMany({ data: PRODUCTS });
  console.log(`${PRODUCTS.length} productos creados`);
}

async function main() {
  console.log('Iniciando seed...');
  await seedUsers();
  await seedProducts();
  console.log('Seed completado');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
