import type { Product } from './product.model';

/** Línea del carro de compras. Un mismo producto con distinto color es otra línea. */
export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedImageUrl?: string;
}
