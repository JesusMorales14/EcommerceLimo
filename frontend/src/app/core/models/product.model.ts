export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount?: number;
  stock: number;
  brand: string;
  category: string;
  subCategory?: string;
  isOffer: boolean;
  isFeatured?: boolean;
  images: string[];
  colors: string[];
  sizes: string[];
  colorImages?: Record<string, string[]>;
}
