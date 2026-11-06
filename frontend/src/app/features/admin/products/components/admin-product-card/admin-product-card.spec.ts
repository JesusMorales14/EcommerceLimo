import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type { Product } from '@core/models/product.model';
import { AdminProductCard } from './admin-product-card';

const PRODUCT = {
  id: 3, name: 'Silla', category: 'hogar', price: 120, stock: 8, isOffer: false, images: [], colors: [], sizes: [],
} as unknown as Product;

describe('AdminProductCard', () => {
  const render = (product: Product = PRODUCT) => {
    const fixture = TestBed.createComponent(AdminProductCard);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  it('muestra los datos principales del producto', () => {
    const { el } = render();
    expect(el.querySelector('.card-name')!.textContent).toContain('Silla');
    expect(el.querySelector('.cat-badge')!.textContent).toContain('hogar');
    expect(el.querySelector('.offer-badge')).toBeNull();
  });

  it('resalta el stock bajo y la oferta', () => {
    const { el } = render({ ...PRODUCT, stock: 2, isOffer: true });
    expect(el.querySelector('.low-stock')).toBeTruthy();
    expect(el.querySelector('.offer-badge')).toBeTruthy();
  });

  it('emite edit y remove con el producto', () => {
    const { fixture, el } = render();
    const edit = vi.fn();
    const remove = vi.fn();
    fixture.componentInstance.edit.subscribe(edit);
    fixture.componentInstance.remove.subscribe(remove);
    el.querySelector<HTMLButtonElement>('.btn-edit')!.click();
    el.querySelector<HTMLButtonElement>('.btn-del')!.click();
    expect(edit).toHaveBeenCalledWith(PRODUCT);
    expect(remove).toHaveBeenCalledWith(PRODUCT);
  });
});
