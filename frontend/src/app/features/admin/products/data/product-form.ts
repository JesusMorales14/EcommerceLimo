import type { Product } from '@core/models/product.model';

/** Valores del formulario de producto (las listas se editan como texto separado por comas). */
export interface ProductFormValue {
  name: string;
  description: string;
  price: number;
  discount: number | null;
  stock: number;
  brand: string;
  category: string;
  subCategory: string;
  sizes: string;
  images: string;
  colors: string;
  /** URLs por color, como texto separado por comas. */
  colorImages: Record<string, string>;
  isOffer: boolean;
  isFeatured: boolean;
}

/** Convierte "a, b, ,c" en ['a', 'b', 'c']. */
export function splitList(value: string | null | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const joinList = (values: readonly string[] | undefined) => (values ?? []).join(', ');

export function emptyProductForm(): ProductFormValue {
  return {
    name: '',
    description: '',
    price: 0,
    discount: null,
    stock: 0,
    brand: '',
    category: '',
    subCategory: '',
    sizes: '',
    images: '',
    colors: '',
    colorImages: {},
    isOffer: false,
    isFeatured: false,
  };
}

/** Producto → valores editables del formulario. */
export function toProductFormValue(product: Product): ProductFormValue {
  const colorImages = Object.fromEntries(
    Object.entries(product.colorImages ?? {}).map(([color, urls]) => [color, joinList(urls)]),
  );
  return {
    name: product.name,
    description: product.description ?? '',
    price: product.price,
    discount: product.discount ?? null,
    stock: product.stock,
    brand: product.brand ?? '',
    category: product.category,
    subCategory: product.subCategory ?? '',
    sizes: joinList(product.sizes),
    images: joinList(product.images),
    colors: joinList(product.colors),
    colorImages,
    isOffer: product.isOffer,
    isFeatured: product.isFeatured ?? false,
  };
}

/**
 * Valores del formulario → payload para la API.
 * Si hay colores, las imágenes principales son las del primer color.
 */
export function toProductPayload(value: ProductFormValue): Partial<Product> {
  const colors = splitList(value.colors);
  const colorImages: Record<string, string[]> = {};
  for (const color of colors) {
    const urls = splitList(value.colorImages[color]);
    if (urls.length) colorImages[color] = urls;
  }
  const images = colors.length ? (colorImages[colors[0]] ?? []) : splitList(value.images);

  return {
    name: value.name.trim(),
    description: value.description.trim(),
    price: Number(value.price),
    ...(value.discount != null && value.discount !== ('' as unknown) && { discount: Number(value.discount) }),
    stock: Number(value.stock),
    brand: value.brand.trim(),
    category: value.category.trim(),
    ...(value.subCategory.trim() && { subCategory: value.subCategory.trim() }),
    isOffer: value.isOffer,
    isFeatured: value.isFeatured,
    images,
    colors,
    sizes: splitList(value.sizes),
    colorImages,
  };
}
