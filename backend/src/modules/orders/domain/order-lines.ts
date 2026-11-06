import type { Product } from '@prisma/client';

export interface RequestedItem {
  productId: number;
  quantity: number;
}

export interface OrderLine {
  productId: number;
  quantity: number;
  /** Precio unitario cobrado (con descuento del producto aplicado). */
  price: number;
}

const PERCENT = 100;
const CENTS = 100;

export class OrderValidationError extends Error {}

export const roundCurrency = (value: number) =>
  Math.round(value * CENTS) / CENTS;

/** Precio de venta vigente de un producto (aplica su descuento porcentual). */
export function unitPrice(
  product: Pick<Product, 'price' | 'discount'>,
): number {
  return roundCurrency(
    product.discount
      ? product.price * (1 - product.discount / PERCENT)
      : product.price,
  );
}

/** Agrupa ítems repetidos del mismo producto sumando sus cantidades. */
export function mergeItems(items: readonly RequestedItem[]): RequestedItem[] {
  const merged = new Map<number, number>();
  for (const { productId, quantity } of items) {
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }
  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
}

/**
 * Construye las líneas del pedido validando existencia y stock (reglas de dominio puras).
 * El precio siempre se toma del catálogo, nunca del cliente.
 */
export function buildOrderLines(
  items: readonly RequestedItem[],
  products: readonly Product[],
): OrderLine[] {
  const catalog = new Map(products.map((product) => [product.id, product]));
  return items.map(({ productId, quantity }) => {
    const product = catalog.get(productId);
    if (!product)
      throw new OrderValidationError(`Producto ${productId} no encontrado`);
    if (product.stock < quantity)
      throw new OrderValidationError(
        `Stock insuficiente para "${product.name}"`,
      );
    return { productId, quantity, price: unitPrice(product) };
  });
}

export function subtotalOf(lines: readonly OrderLine[]): number {
  return roundCurrency(
    lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
  );
}
