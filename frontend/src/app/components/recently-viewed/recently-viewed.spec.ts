import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { RecentlyViewed } from './recently-viewed';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { CartService } from '../../core/services/cart';
import { Product } from '../../core/models/product.model';

const mockProduct: Product = {
  id: 1, name: 'Camiseta', description: 'desc', price: 50, discount: 10,
  stock: 5, brand: 'Marca', category: 'Ropa', isOffer: true,
  images: ['img.jpg'], colors: ['rojo'], sizes: ['M'],
};

describe('RecentlyViewed', () => {
  let component: RecentlyViewed;
  let fixture: ComponentFixture<RecentlyViewed>;
  let rvService: RecentlyViewedService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentlyViewed],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentlyViewed);
    component = fixture.componentInstance;
    rvService = TestBed.inject(RecentlyViewedService);
    // Limpiamos el estado del servicio directamente (es un signal interno)
    rvService.clear();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no renderiza la sección cuando no hay productos vistos recientemente', () => {
    expect(fixture.nativeElement.querySelector('.rv-section')).toBeFalsy();
  });

  describe('con productos vistos', () => {
    beforeEach(() => {
      rvService.add(mockProduct);
      fixture.detectChanges();
    });

    it('renderiza la sección con el producto agregado', () => {
      const cards = fixture.nativeElement.querySelectorAll('.rv-card');
      expect(cards.length).toBe(1);
    });

    it('limpia el historial al hacer click en "Limpiar historial"', () => {
      const clearBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.rv-clear');
      clearBtn.click();
      fixture.detectChanges();
      expect(rvService.items().length).toBe(0);
      expect(fixture.nativeElement.querySelector('.rv-section')).toBeFalsy();
    });
  });

  describe('addToCart', () => {
    it('agrega el producto al carrito y previene la navegación', () => {
      const cartService = TestBed.inject(CartService);
      const addSpy = vi.spyOn(cartService, 'addToCart');
      const event = new Event('click', { cancelable: true });
      const preventSpy = vi.spyOn(event, 'preventDefault');
      const stopSpy = vi.spyOn(event, 'stopPropagation');

      component.addToCart(mockProduct, event);

      expect(addSpy).toHaveBeenCalledWith(mockProduct);
      expect(preventSpy).toHaveBeenCalled();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('agrega el producto al hacer click en el botón "Agregar" del card', () => {
      rvService.add(mockProduct);
      fixture.detectChanges();

      const addBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.rv-add-btn');
      addBtn.click();

      expect(component.cartService.getItems()().length).toBe(1);
    });
  });
});
