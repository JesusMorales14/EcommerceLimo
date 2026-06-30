import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { BottomNav } from './bottom-nav';
import { CartService } from '../../core/services/cart';

describe('BottomNav', () => {
  let component: BottomNav;
  let fixture: ComponentFixture<BottomNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNav],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('openCart', () => {
    it('abre el carrito al hacer click en el botón del carrito', () => {
      fixture.detectChanges();
      const cartBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.nav-cart-fab');
      cartBtn.click();
      expect(component.cartService.isOpen()).toBe(true);
    });

    it('llama a cartService.openCart()', () => {
      const spy = vi.spyOn(component.cartService, 'openCart');
      component.openCart();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('badges', () => {
    it('no muestra badge de carrito cuando count es 0', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.nav-badge:not(.nav-badge-fav)')).toBeFalsy();
    });

    it('muestra el badge del carrito con la cantidad cuando hay ítems', () => {
      const cartService = TestBed.inject(CartService);
      cartService.addToCart({
        id: 1, name: 'P', description: '', price: 10, stock: 5,
        brand: 'B', category: 'C', isOffer: false, images: [], colors: [], sizes: [],
      });
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.nav-badge:not(.nav-badge-fav)');
      expect(badge?.textContent?.trim()).toBe('1');
    });
  });
});
