import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductDetailComponent } from './product-detail';
import { environment } from '../../../environments/environment';

const base = environment.apiUrl;

const mockProduct = {
  id: 1, name: 'Samsung Galaxy S24', price: 2800, description: 'Smartphone flagship',
  brand: 'Samsung', category: 'tecnologia', subCategory: 'smartphones',
  images: ['img1.jpg', 'img2.jpg'], colors: ['#000', '#fff'], sizes: ['128GB', '256GB'],
  colorImages: { '#000': ['img-black-1.jpg'] },
  isOffer: false, discount: null, stock: 10,
};
const mockReviews = [{ id: 1, rating: 5, comment: 'Excelente', user: { id: 2, name: 'Ana' }, createdAt: '' }];
const mockStats   = { average: 5, total: 1, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 } };

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture:   ComponentFixture<ProductDetailComponent>;
  let http:      HttpTestingController;

  const flushAll = (product = mockProduct) => {
    http.expectOne(`${base}/products/1`).flush(product);
    http.expectOne(`${base}/reviews/product/1`).flush(mockReviews);
    http.expectOne(`${base}/reviews/product/1/stats`).flush(mockStats);
  };

  beforeEach(async () => {
    localStorage.setItem('gh_token', 'test-token');
    localStorage.setItem('gh_user', JSON.stringify({ id: 1, name: 'Test', email: 'test@test.com', role: 'USER' }));

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    http      = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('debería crearse correctamente', () => {
    fixture.detectChanges();
    flushAll();
    expect(component).toBeTruthy();
  });

  it('inicia con loading en true y sin producto', () => {
    expect(component.loading()).toBe(true);
    expect(component.producto()).toBeNull();
    fixture.detectChanges();
    flushAll();
  });

  describe('ngOnInit', () => {
    it('carga el producto y desactiva loading', () => {
      fixture.detectChanges();
      flushAll();
      expect(component.producto()?.name).toBe('Samsung Galaxy S24');
      expect(component.loading()).toBe(false);
    });

    it('carga las reseñas y las estadísticas', () => {
      fixture.detectChanges();
      flushAll();
      expect(component.reviews()).toHaveLength(1);
      expect(component.reviewStats()?.average).toBe(5);
    });

    it('asigna el primer size disponible', () => {
      fixture.detectChanges();
      flushAll();
      expect(component.selectedSize()).toBe('128GB');
    });

    it('desactiva loading aunque haya error al cargar el producto', () => {
      fixture.detectChanges();
      http.expectOne(`${base}/products/1`).error(new ErrorEvent('error'));
      expect(component.loading()).toBe(false);
    });
  });

  describe('quantity', () => {
    it('inicia en 1', () => {
      expect(component.quantity()).toBe(1);
      fixture.detectChanges();
      flushAll();
    });
  });

  describe('activeImages (computed)', () => {
    it('retorna las imágenes del color seleccionado si existen colorImages', () => {
      fixture.detectChanges();
      flushAll();
      component.selectedColor.set(0); // color '#000'
      expect(component.activeImages()).toEqual(['img-black-1.jpg']);
    });

    it('retorna las imágenes base si no hay colorImages para el color seleccionado', () => {
      fixture.detectChanges();
      flushAll();
      component.selectedColor.set(1); // color '#fff' sin colorImages
      expect(component.activeImages()).toEqual(mockProduct.images);
    });

    it('retorna arreglo vacío antes de cargar el producto', () => {
      expect(component.activeImages()).toEqual([]);
      fixture.detectChanges();
      flushAll();
    });
  });

  describe('tabs', () => {
    it('incluye la pestaña de opiniones con el total de reseñas', () => {
      fixture.detectChanges();
      flushAll();
      const tabs = component.tabs();
      expect(tabs[2]).toContain('1');
    });
  });

  describe('submitReview', () => {
    it('no envía la reseña si el comentario está vacío', () => {
      fixture.detectChanges();
      flushAll();
      component.newComment = '';
      component.submitReview();
      expect(component.reviewError()).toContain('comentario');
      http.expectNone(`${base}/reviews/product/1`);
    });

    it('no envía si el producto no está cargado', () => {
      expect(component.producto()).toBeNull();
      component.submitReview();
      fixture.detectChanges();
      flushAll();
    });
  });
});
