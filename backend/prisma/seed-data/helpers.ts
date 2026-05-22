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

export const mk =
  (cat: string, sub: string) =>
  (
    name: string, brand: string, usd: number, stock: number,
    desc: string,
    colors: string[] = [], sizes: string[] = [], offer?: number,
  ): Product => ({
    name, brand, category: cat, subCategory: sub,
    price: pen(usd), stock, description: desc, images: [],
    colors, sizes,
    ...(offer != null ? { isOffer: true, discount: offer } : {}),
  });
