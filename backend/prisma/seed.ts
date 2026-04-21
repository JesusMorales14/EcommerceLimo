import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed completo...');

  // USER
  const passwordHash = await bcrypt.hash('123456', 10);

  const user = await prisma.user.upsert({
    where: {
      email: 'test@test.com',
    },
    update: {},
    create: {
      email: 'test@test.com',
      password: passwordHash,
      name: 'Test User',
    },
  });

  console.log('User creado:', user.id);

  // CATEGORIES
  const electronics = await prisma.category.upsert({
    where: { id: 1 }, // o usa name si lo haces único
    update: {},
    create: { name: 'Electronics' },
  });

  const clothing = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Clothing' },
  });

  // 🛒 PRODUCTS (idempotente con upsert)
  const iphone = await prisma.product.upsert({
    where: { name: 'iPhone 15 Pro' },
    update: {},
    create: {
      name: 'iPhone 15 Pro',
      description: 'Apple smartphone premium',
      price: 1200,
      stock: 10,
      images: ['iphone.jpg'],
      colors: ['black'],
      sizes: ['M'],
      categoryId: electronics.id,
    },
  });

  const macbook = await prisma.product.upsert({
    where: { name: 'MacBook Pro' },
    update: {},
    create: {
      name: 'MacBook Pro',
      description: 'Laptop Apple M3',
      price: 2500,
      stock: 5,
      images: ['macbook.jpg'],
      colors: ['gray'],
      sizes: ['M'],
      categoryId: electronics.id,
    },
  });

  const nike = await prisma.product.upsert({
    where: { name: 'Nike Air Force 1' },
    update: {},
    create: {
      name: 'Nike Air Force 1',
      description: 'Classic sneakers',
      price: 150,
      stock: 20,
      images: ['nike.jpg'],
      colors: ['white'],
      sizes: ['40', '41'],
      categoryId: clothing.id,
    },
  });

  // 👇 opcional: mantener array como antes
  const products = [iphone, macbook, nike];

  console.log('Products creados o actualizados');

  // 🛒 CART REAL
  const cart = await prisma.cart.create({
    data: {
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
          },
          {
            productId: products[2].id,
            quantity: 2,
          },
        ],
      },
    },
  });

  console.log('Cart creado');

  // ORDER REALISTA
  const order = await prisma.order.create({
    data: {
      status: 'pending',
      userId: user.id,
      total: products[0].price * 1 + products[2].price * 2,

      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
          },
          {
            productId: products[2].id,
            quantity: 2,
          },
        ],
      },
    },
  });

  console.log('Order creada:', order.id);

  console.log('Seed COMPLETO listo');
}

main()
  .catch((e) => {
    console.error('Error seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
