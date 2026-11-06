import type { Product } from '@core/models/product.model';

const PERCENT = 100;

/** Precio final de un producto aplicando su descuento porcentual (si lo tiene). */
export function discountedPrice(product: Pick<Product, 'price' | 'discount'>): number {
  return product.discount ? product.price * (1 - product.discount / PERCENT) : product.price;
}

/** Monto de cada cuota sin interés. */
export function installmentAmount(total: number, installments: number): number {
  return installments > 0 ? total / installments : total;
}
