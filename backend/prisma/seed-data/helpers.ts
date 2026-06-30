export type Product = {
  name: string; brand: string; category: string; subCategory: string;
  price: number; stock: number; description: string;
  images: string[]; colors: string[]; sizes: string[];
  isOffer?: boolean; discount?: number;
};

export const BLK = '#1a1a1a';
export const WHT = '#f0f0f0';
export const SLV = '#c0c0c0';

export const pen = (usd: number) => Math.round((usd * 3.8) / 10) * 10;

// hash determinista para variar la foto entre productos de una misma subcategoría
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

// palabras clave reales (en inglés) por categoría/subcategoría, usadas contra LoremFlickr
// para que cada producto muestre una foto temáticamente correcta.
const KEYWORDS: Record<string, string> = {
  'electrodomesticos/refrigeradores': 'refrigerator,kitchen',
  'electrodomesticos/lavadoras': 'washing-machine,laundry',
  'electrodomesticos/cocinas': 'kitchen-stove,oven',
  'electrodomesticos/microondas': 'microwave,kitchen',

  'belleza/maquillaje': 'makeup,cosmetics',
  'belleza/skincare': 'skincare,cosmetics',
  'belleza/perfumes': 'perfume,fragrance',
  'belleza/cabello': 'hair,haircare',

  'deporte/ropa-deportiva': 'sportswear,activewear',
  'deporte/gimnasio': 'gym,fitness',
  'deporte/outdoor': 'camping,outdoor',
  'deporte/bicicletas': 'bicycle',

  'hogar/muebles': 'furniture',
  'hogar/iluminacion': 'lamp,lighting',
  'hogar/decoracion': 'homedecor',
  'hogar/textiles': 'textile,fabric',

  'moda-hombre/camisas': 'mens-shirt',
  'moda-hombre/pantalones': 'mens-pants',
  'moda-hombre/calzado': 'mens-shoes',
  'moda-hombre/accesorios': 'mens-accessories,watch',

  'moda-mujer/vestidos': 'dress,womens-fashion',
  'moda-mujer/blusas': 'blouse,womens-fashion',
  'moda-mujer/jeans': 'jeans,womens-fashion',
  'moda-mujer/calzado': 'womens-shoes',

  'tecnologia/smartphones': 'smartphone',
  'tecnologia/laptops': 'laptop',
  'tecnologia/consolas': 'game-console',
  'tecnologia/audio': 'headphones,speaker',
  'tecnologia/televisores': 'television',
};

export const mk =
  (cat: string, sub: string) =>
  (
    name: string, brand: string, usd: number, stock: number,
    desc: string,
    colors: string[] = [], sizes: string[] = [], offer?: number,
  ): Product => {
    const keywords = KEYWORDS[`${cat}/${sub}`] ?? `${cat},${sub}`;
    const seed = hash(name);
    return {
      name, brand, category: cat, subCategory: sub,
      price: pen(usd), stock, description: desc,
      images: [
        `https://loremflickr.com/600/600/${keywords}?lock=${seed}`,
        `https://loremflickr.com/600/600/${keywords}?lock=${seed + 1}`,
      ],
      colors, sizes,
      ...(offer != null ? { isOffer: true, discount: offer } : {}),
    };
  };
