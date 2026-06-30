import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PoliticaPrivacidadPage } from './politica-privacidad';

describe('PoliticaPrivacidadPage', () => {
  let component: PoliticaPrivacidadPage;
  let fixture: ComponentFixture<PoliticaPrivacidadPage>;

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
      imports: [PoliticaPrivacidadPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PoliticaPrivacidadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('inicia con la primera sección activa', () => {
    expect(component.activeSection()).toBe('responsable');
  });

  describe('scrollTo', () => {
    it('actualiza la sección activa', () => {
      component.scrollTo('cookies');
      expect(component.activeSection()).toBe('cookies');
    });
  });
});
