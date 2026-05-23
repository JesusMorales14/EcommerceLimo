import { TestBed } from '@angular/core/testing';
import { CartService, CartItem } from './cart';
import { Product } from '../models/product.model';

const mockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  name: 'Samsung Galaxy S24',
  brand: 'Samsung',
  price: 1899,
  stock: 10,
  images: [],
  colors: [],
  sizes: [],
  category: 'tecnologia',
  subCategory: 'smartphones',
  description: 'Smartphone de alta gama',
  isOffer: false,
  colorImages: {},
  ...overrides,
});

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
    service.clear();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // ── addToCart ────────────────────────────────────────────────────────────────

  describe('addToCart', () => {
    it('agrega un producto nuevo al carrito', () => {
      service.addToCart(mockProduct(), 1);
      expect(service.getItems()().length).toBe(1);
      expect(service.count()).toBe(1);
    });

    it('incrementa la cantidad si el mismo producto y color ya están en el carrito', () => {
      const product = mockProduct();
      service.addToCart(product, 1, 'Negro');
      service.addToCart(product, 2, 'Negro');
      expect(service.getItems()().length).toBe(1);
      expect(service.count()).toBe(3);
    });

    it('trata el mismo producto con distinto color como ítem separado', () => {
      const product = mockProduct();
      service.addToCart(product, 1, 'Negro');
      service.addToCart(product, 1, 'Blanco');
      expect(service.getItems()().length).toBe(2);
      expect(service.count()).toBe(2);
    });

    it('abre el carrito al agregar un producto', () => {
      service.closeCart();
      service.addToCart(mockProduct(), 1);
      expect(service.isOpen()).toBe(true);
    });

    it('guarda la URL de imagen seleccionada', () => {
      service.addToCart(mockProduct(), 1, 'Negro', 'https://img.com/negro.jpg');
      expect(service.getItems()()[0].selectedImageUrl).toBe('https://img.com/negro.jpg');
    });
  });

  // ── removeFromCart ───────────────────────────────────────────────────────────

  describe('removeFromCart', () => {
    it('elimina el producto del carrito', () => {
      const product = mockProduct();
      service.addToCart(product, 2);
      service.removeFromCart(product.id);
      expect(service.getItems()().length).toBe(0);
    });

    it('elimina solo el color indicado, no todos los ítems del producto', () => {
      const product = mockProduct();
      service.addToCart(product, 1, 'Negro');
      service.addToCart(product, 1, 'Blanco');
      service.removeFromCart(product.id, 'Negro');
      expect(service.getItems()().length).toBe(1);
      expect(service.getItems()()[0].selectedColor).toBe('Blanco');
    });

    it('no falla si el producto no está en el carrito', () => {
      expect(() => service.removeFromCart(999)).not.toThrow();
    });
  });

  // ── updateQty ────────────────────────────────────────────────────────────────

  describe('updateQty', () => {
    it('actualiza la cantidad de un producto existente', () => {
      const product = mockProduct();
      service.addToCart(product, 1);
      service.updateQty(product.id, 5);
      expect(service.getItems()()[0].quantity).toBe(5);
    });

    it('elimina el producto si la cantidad nueva es 0', () => {
      const product = mockProduct();
      service.addToCart(product, 3);
      service.updateQty(product.id, 0);
      expect(service.getItems()().length).toBe(0);
    });

    it('elimina el producto si la cantidad nueva es negativa', () => {
      const product = mockProduct();
      service.addToCart(product, 3);
      service.updateQty(product.id, -1);
      expect(service.getItems()().length).toBe(0);
    });
  });

  // ── itemPrice ────────────────────────────────────────────────────────────────

  describe('itemPrice', () => {
    it('retorna el precio original si no hay descuento', () => {
      const item: CartItem = { product: mockProduct({ price: 1000 }), quantity: 1 };
      expect(service.itemPrice(item)).toBe(1000);
    });

    it('aplica el porcentaje de descuento correctamente', () => {
      const item: CartItem = { product: mockProduct({ price: 1000, discount: 20 }), quantity: 1 };
      expect(service.itemPrice(item)).toBe(800);
    });

    it('aplica descuento del 100% correctamente', () => {
      const item: CartItem = { product: mockProduct({ price: 500, discount: 100 }), quantity: 1 };
      expect(service.itemPrice(item)).toBe(0);
    });
  });

  // ── count y total ────────────────────────────────────────────────────────────

  describe('count y total', () => {
    it('count y total son 0 con el carrito vacío', () => {
      expect(service.count()).toBe(0);
      expect(service.total()).toBe(0);
    });

    it('calcula count sumando cantidades de todos los ítems', () => {
      service.addToCart(mockProduct({ id: 1 }), 3);
      service.addToCart(mockProduct({ id: 2 }), 2);
      expect(service.count()).toBe(5);
    });

    it('calcula total multiplicando precio × cantidad por cada ítem', () => {
      service.addToCart(mockProduct({ id: 1, price: 100 }), 2);
      service.addToCart(mockProduct({ id: 2, price: 200 }), 3);
      expect(service.total()).toBe(800);
    });

    it('aplica el descuento al calcular el total', () => {
      service.addToCart(mockProduct({ id: 1, price: 1000, discount: 10 }), 2);
      expect(service.total()).toBe(1800);
    });
  });

  // ── clear ────────────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('vacía el carrito completamente', () => {
      service.addToCart(mockProduct({ id: 1 }), 2);
      service.addToCart(mockProduct({ id: 2 }), 1);
      service.clear();
      expect(service.getItems()().length).toBe(0);
      expect(service.count()).toBe(0);
      expect(service.total()).toBe(0);
    });
  });

  // ── openCart / closeCart ─────────────────────────────────────────────────────

  describe('openCart y closeCart', () => {
    it('abre el carrito', () => {
      service.closeCart();
      service.openCart();
      expect(service.isOpen()).toBe(true);
    });

    it('cierra el carrito', () => {
      service.openCart();
      service.closeCart();
      expect(service.isOpen()).toBe(false);
    });
  });
});
