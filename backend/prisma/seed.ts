import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando seed completo...');

  // =========================
  // 🔐 USER
  // =========================
  const passwordHash = await bcrypt.hash('123456', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      password: passwordHash,
      name: 'Test User',
    },
  });

  console.log('👤 User creado:', user.id);

  // =========================
  // 🏷️ CATEGORIES
  // (IMPORTANTE: usamos id para evitar errores de unique)
  // =========================
  const electronics = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Electronics' },
  });

  const clothing = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'Clothing' },
  });

  console.log('🏷️ Categories listas');

  // =========================
  // 📦 PRODUCTS
  // =========================
  const iphone = await prisma.product.upsert({
    where: { name: 'iPhone 15 Pro' },
    update: {},
    create: {
      name: 'iPhone 15 Pro',
      description: 'Apple smartphone premium',
      price: 1200,
      discount: null,
      stock: 10,
      images: ['iphone.jpg'],
      colors: ['black'],
      sizes: ['M'],
      categoryId: electronics.id,

      // 🔥 NUEVO (FRONTEND COMPATIBILITY)
      categoryName: 'electronics',
      subCategory: 'smartphones',
    },
  });

  const macbook = await prisma.product.upsert({
    where: { name: 'MacBook Pro' },
    update: {},
    create: {
      name: 'MacBook Pro',
      description: 'Laptop Apple M3',
      price: 2500,
      discount: null,
      stock: 5,
      images: ['macbook.jpg'],
      colors: ['gray'],
      sizes: ['M'],
      categoryId: electronics.id,

      categoryName: 'electronics',
      subCategory: 'laptops',
    },
  });

  const nike = await prisma.product.upsert({
    where: { name: 'Nike Air Force 1' },
    update: {},
    create: {
      name: 'Nike Air Force 1',
      description: 'Classic sneakers',
      price: 150,
      discount: null,
      stock: 20,
      images: ['nike.jpg'],
      colors: ['white'],
      sizes: ['40', '41'],
      categoryId: clothing.id,

      categoryName: 'fashion',
      subCategory: 'shoes',
    },
  });

  console.log('📦 Products creados');

  // =========================
  // 🛒 CART
  // (SIN userId porque tu schema aún no lo soporta)
  // =========================
  const cart = await prisma.cart.create({
    data: {
      userId: user.id, // ✔ obligatorio por schema

      items: {
        create: [
          {
            productId: iphone.id,
            quantity: 1,
          },
          {
            productId: nike.id,
            quantity: 2,
          },
        ],
      },
    },
  });

  console.log('🛒 Cart creado:', cart.id);

  // =========================
  // 📦 ORDER
  // =========================
  const order = await prisma.order.create({
    data: {
      status: 'pending',
      userId: user.id,
      total: iphone.price * 1 + nike.price * 2,
      items: {
        create: [
          {
            productId: iphone.id,
            quantity: 1,
          },
          {
            productId: nike.id,
            quantity: 2,
          },
        ],
      },
    },
  });

  console.log('📦 Order creada:', order.id);

  console.log('✅ SEED COMPLETO LISTO');
}

main()
  .catch((e) => {
    console.error('❌ Error seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
