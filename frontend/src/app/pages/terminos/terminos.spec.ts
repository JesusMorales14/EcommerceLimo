import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TerminosPage } from './terminos';

describe('TerminosPage', () => {
  let component: TerminosPage;
  let fixture: ComponentFixture<TerminosPage>;

  beforeEach(async () => {
    // jsdom no implementa IntersectionObserver — lo mockeamos antes de crear el componente
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: function() {
        return { observe: () => {}, unobserve: () => {}, disconnect: () => {} };
      },
    });

    await TestBed.configureTestingModule({
      imports: [TerminosPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TerminosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('inicia con la primera sección activa', () => {
    expect(component.activeSection()).toBe('aceptacion');
  });

  describe('scrollTo', () => {
    it('actualiza la sección activa', () => {
      component.scrollTo('compras');
      expect(component.activeSection()).toBe('compras');
    });
  });
});
