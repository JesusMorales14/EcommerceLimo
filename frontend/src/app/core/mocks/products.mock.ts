export interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  images: string[];
  stock: number;
  isOffer?: boolean;
}

export const PRODUCTOS_MOCK: Product[] = [
  // ==========================================
  // FASHION (Total 32 productos)
  // ==========================================
  // Sub: hombre (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 100 + i, name: `Camisa Slim Fit Premium ${i + 1}`, brand: "EDITORIAL",
    description: "Corte moderno en algodón egipcio.", price: 45 + i * 5,
    category: "fashion", subCategory: "hombre", images: [`https://picsum.photos/id/${10 + i}/400/500`], stock: 10
  })),
  // Sub: mujer (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 110 + i, name: `Vestido Elegant Summer ${i + 1}`, brand: "EDITORIAL",
    description: "Fluidez y estilo para la temporada.", price: 60 + i * 10,
    category: "fashion", subCategory: "mujer", images: [`https://picsum.photos/id/${20 + i}/400/500`], stock: 8
  })),
  // Sub: calzado (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 120 + i, name: `Sneakers Urban Pro ${i + 1}`, brand: "WALKER",
    description: "Comodidad urbana con diseño minimalista.", price: 80 + i * 15,
    category: "fashion", subCategory: "calzado", images: [`https://picsum.photos/id/${30 + i}/400/500`], stock: 15
  })),
  // Sub: accesorios (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 130 + i, name: `Reloj Chrono Gold ${i + 1}`, brand: "TIMELESS",
    description: "Accesorio de lujo resistente al agua.", price: 120 + i * 20,
    category: "fashion", subCategory: "accesorios", images: [`https://picsum.photos/id/${40 + i}/400/500`], stock: 5
  })),

  // ==========================================
  // ELECTRONICS (Total 32 productos)
  // ==========================================
  // Sub: consolas (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 200 + i, name: `Consola NextGen G${i + 1}`, brand: "SONY/MS",
    description: "Potencia gráfica 4K ultra realista.", price: 499 + i * 50,
    category: "electronics", subCategory: "consolas", images: [`https://picsum.photos/id/${50 + i}/400/500`], stock: 4
  })),
  // Sub: laptops (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 210 + i, name: `Laptop WorkStation Pro ${i + 1}`, brand: "TECH",
    description: "Ideal para edición de video y renderizado.", price: 1200 + i * 100,
    category: "electronics", subCategory: "laptops", images: [`https://picsum.photos/id/${60 + i}/400/500`], stock: 6
  })),
  // Sub: audio (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 220 + i, name: `Headphones Hi-Fi ${i + 1}`, brand: "AUDIO PRO",
    description: "Sonido envolvente sin cables.", price: 150 + i * 25,
    category: "electronics", subCategory: "audio", images: [`https://picsum.photos/id/${70 + i}/400/500`], stock: 12
  })),
  // Sub: smartphones (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 230 + i, name: `Smart Core S${i + 1}`, brand: "SAMSUNG",
    description: "Cámara inteligente de última generación.", price: 800 + i * 80,
    category: "electronics", subCategory: "smartphones", images: [`https://picsum.photos/id/${80 + i}/400/500`], stock: 9
  })),

  // ==========================================
  // HOME & DECOR (Total 24 productos)
  // ==========================================
  // Sub: muebles (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 300 + i, name: `Silla Nordic Design ${i + 1}`, brand: "HOME",
    description: "Estructura de madera noble.", price: 110 + i * 12,
    category: "home-decor", subCategory: "muebles", images: [`https://picsum.photos/id/${90 + i}/400/500`], stock: 7
  })),
  // Sub: iluminacion (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 310 + i, name: `Lámpara Industrial ${i + 1}`, brand: "GLOW",
    description: "Iluminación cálida estilo retro.", price: 45 + i * 8,
    category: "home-decor", subCategory: "iluminacion", images: [`https://picsum.photos/id/${100 + i}/400/500`], stock: 14
  })),
  // Sub: decoracion (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 320 + i, name: `Espejo Abstract ${i + 1}`, brand: "DECO",
    description: "Pieza única para tu sala.", price: 75 + i * 15,
    category: "home-decor", subCategory: "decoracion", images: [`https://picsum.photos/id/${110 + i}/400/500`], stock: 3
  })),

  // ==========================================
  // BEAUTY (Total 24 productos)
  // ==========================================
  // Sub: maquillaje (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 400 + i, name: `Palette Studio Pro ${i + 1}`, brand: "GLAM",
    description: "Colores vibrantes de larga duración.", price: 35 + i * 4,
    category: "beauty", subCategory: "maquillaje", images: [`https://picsum.photos/id/${120 + i}/400/500`], stock: 20
  })),
  // Sub: skincare (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 410 + i, name: `Facial Cleanser ${i + 1}`, brand: "PURE",
    description: "Limpieza profunda para piel sensible.", price: 25 + i * 5,
    category: "beauty", subCategory: "skincare", images: [`https://picsum.photos/id/${130 + i}/400/500`], stock: 18
  })),
  // Sub: perfumes (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 420 + i, name: `Eau de Parfum ${i + 1}`, brand: "ESSENCE",
    description: "Fragancia floral intensa.", price: 90 + i * 15,
    category: "beauty", subCategory: "perfumes", images: [`https://picsum.photos/id/${140 + i}/400/500`], stock: 6
  })),

  // ==========================================
  // SPORTS (Total 32 productos)
  // ==========================================
  // Sub: ropa-deportiva (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 500 + i, name: `Leggings Pro Tech ${i + 1}`, brand: "ACTIVE",
    description: "Tela transpirable de alto rendimiento.", price: 40 + i * 6,
    category: "sports", subCategory: "ropa-deportiva", images: [`https://picsum.photos/id/${150 + i}/400/500`], stock: 25
  })),
  // Sub: maquinas-gym (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 510 + i, name: `Power Station ${i + 1}`, brand: "FITPRO",
    description: "Multifuncional para casa.", price: 450 + i * 80,
    category: "sports", subCategory: "maquinas-gym", images: [`https://picsum.photos/id/${160 + i}/400/500`], stock: 2
  })),
  // Sub: suplementos (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 520 + i, name: `Iso Whey Protein ${i + 1}`, brand: "NUTRITION",
    description: "Proteína pura post-entrenamiento.", price: 55 + i * 10,
    category: "sports", subCategory: "suplementos", images: [`https://picsum.photos/id/${170 + i}/400/500`], stock: 30
  })),
  // Sub: outdoor (8)
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 530 + i, name: `Tienda Extreme ${i + 1}`, brand: "CAMP",
    description: "Resistente a climas extremos.", price: 200 + i * 30,
    category: "sports", subCategory: "outdoor", images: [`https://picsum.photos/id/${180 + i}/400/500`], stock: 5
  })),

  // ==========================================
  // OFFERS (8 productos especiales)
  // ==========================================
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: 900 + i, name: `Super Offer Item ${i + 1}`, brand: "OUTLET",
    description: "Oportunidad única hasta agotar stock.", price: 15 + i * 5,
    category: "offers", subCategory: "", images: [`https://picsum.photos/id/${190 + i}/400/500`], stock: 50, isOffer: true
  }))
];
