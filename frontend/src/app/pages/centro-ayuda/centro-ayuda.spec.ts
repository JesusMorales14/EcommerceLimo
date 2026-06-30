import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CentroAyudaPage } from './centro-ayuda';

describe('CentroAyudaPage', () => {
  let component: CentroAyudaPage;
  let fixture: ComponentFixture<CentroAyudaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentroAyudaPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CentroAyudaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('inicia con la categoría "todos" activa', () => {
    expect(component.activeCategory()).toBe('todos');
  });

  describe('setCategory', () => {
    it('cambia la categoría activa', () => {
      component.setCategory('pedidos');
      expect(component.activeCategory()).toBe('pedidos');
    });
  });

  describe('filteredFaqs', () => {
    it('retorna todas las FAQs cuando la categoría es "todos"', () => {
      component.setCategory('todos');
      expect(component.filteredFaqs().length).toBeGreaterThan(0);
    });

    it('filtra las FAQs por la categoría seleccionada', () => {
      component.setCategory('pagos');
      const faqs = component.filteredFaqs();
      expect(faqs.length).toBeGreaterThan(0);
      expect(faqs.every(f => f.category === 'pagos')).toBe(true);
    });

    it('no retorna FAQs de otras categorías cuando hay filtro activo', () => {
      component.setCategory('envios');
      const faqs = component.filteredFaqs();
      expect(faqs.every(f => f.category === 'envios')).toBe(true);
    });
  });

  describe('toggle', () => {
    it('abre una FAQ al hacer toggle', () => {
      const faqId = component.filteredFaqs()[0].id;
      component.toggle(faqId);
      expect(component.filteredFaqs().find(f => f.id === faqId)?.open).toBe(true);
    });

    it('cierra una FAQ que ya estaba abierta', () => {
      const faqId = component.filteredFaqs()[0].id;
      component.toggle(faqId);
      component.toggle(faqId);
      expect(component.filteredFaqs().find(f => f.id === faqId)?.open).toBe(false);
    });
  });
});
