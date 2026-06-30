import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AdminProductCard } from './admin-product-card';
import { Product } from '../../core/models/product.model';

const mockProduct: Product = {
  id: 1,
  name: 'Zapatilla Running',
  description: 'Zapatilla deportiva',
  price: 250,
  discount: 0,
  stock: 10,
  brand: 'Nike',
  category: 'Calzado',
  isOffer: false,
  images: ['img1.jpg'],
  colors: ['negro'],
  sizes: ['40'],
};

describe('AdminProductCard', () => {
  let component: AdminProductCard;
  let fixture: ComponentFixture<AdminProductCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductCard);
    component = fixture.componentInstance;
    // Asignamos el input ANTES de la primera detección de cambios
    component.product = mockProduct;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('outputs', () => {
    it('emite el evento edit con el producto al hacer click en editar', () => {
      const spy = vi.fn();
      component.edit.subscribe(spy);

      const editBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-edit');
      editBtn.click();

      expect(spy).toHaveBeenCalledWith(mockProduct);
    });

    it('emite el evento remove con el id del producto al hacer click en eliminar', () => {
      const spy = vi.fn();
      component.remove.subscribe(spy);

      const delBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-del');
      delBtn.click();

      expect(spy).toHaveBeenCalledWith(mockProduct.id);
    });
  });

  describe('render', () => {
    it('muestra el nombre del producto', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.card-name')?.textContent).toContain('Zapatilla Running');
    });

    it('muestra la categoría del producto', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.cat-badge')?.textContent).toContain('Calzado');
    });

    it('no muestra el badge de oferta cuando isOffer es false', () => {
      const offerBadge = fixture.nativeElement.querySelector('.offer-badge');
      expect(offerBadge).toBeFalsy();
    });
  });

  describe('render con variantes', () => {
    it('marca el stock como bajo cuando es menor a 5', async () => {
      // Necesitamos un fixture nuevo con stock bajo para evitar NG0100
      const fixture2 = TestBed.createComponent(AdminProductCard);
      const comp2 = fixture2.componentInstance;
      comp2.product = { ...mockProduct, stock: 2 };
      fixture2.detectChanges();

      const stockEl: HTMLElement | null = fixture2.nativeElement.querySelector('.low-stock');
      expect(stockEl).toBeTruthy();
      expect(stockEl?.textContent?.trim()).toBe('2');
    });

    it('muestra el badge de oferta cuando isOffer es true', () => {
      const fixture3 = TestBed.createComponent(AdminProductCard);
      const comp3 = fixture3.componentInstance;
      comp3.product = { ...mockProduct, isOffer: true };
      fixture3.detectChanges();

      const offerBadge = fixture3.nativeElement.querySelector('.offer-badge');
      expect(offerBadge).toBeTruthy();
    });
  });
});
