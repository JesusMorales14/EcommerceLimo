import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ChatSupport } from './chat-support';

describe('ChatSupport', () => {
  let component: ChatSupport;
  let fixture: ComponentFixture<ChatSupport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSupport],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatSupport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('inicia cerrado y sin FAQ activa', () => {
    expect(component.isOpen()).toBe(false);
    expect(component.activeFaq()).toBeNull();
  });

  describe('toggle', () => {
    it('abre el chat al hacer toggle desde cerrado', () => {
      component.toggle();
      expect(component.isOpen()).toBe(true);
    });

    it('cierra el chat al hacer toggle desde abierto y limpia la FAQ activa', () => {
      component.toggle();
      component.select(component.faqs[0]);
      component.toggle();
      expect(component.isOpen()).toBe(false);
      expect(component.activeFaq()).toBeNull();
    });

    it('refleja el cambio en el DOM al hacer click en el botón flotante', () => {
      fixture.detectChanges();
      const fab: HTMLButtonElement = fixture.nativeElement.querySelector('.chat-fab');
      fab.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.chat-panel')).toBeTruthy();
    });
  });

  describe('close', () => {
    it('cierra el chat y limpia la FAQ activa', () => {
      component.toggle();
      component.select(component.faqs[0]);
      component.close();
      expect(component.isOpen()).toBe(false);
      expect(component.activeFaq()).toBeNull();
    });
  });

  describe('select / back', () => {
    it('select activa la FAQ elegida', () => {
      const faq = component.faqs[1];
      component.select(faq);
      expect(component.activeFaq()).toEqual(faq);
    });

    it('back limpia la FAQ activa sin cerrar el chat', () => {
      component.toggle();
      component.select(component.faqs[0]);
      component.back();
      expect(component.activeFaq()).toBeNull();
      expect(component.isOpen()).toBe(true);
    });
  });

  describe('answerLines', () => {
    it('divide la respuesta en líneas separadas por salto de línea', () => {
      const lines = component.answerLines('línea1\nlínea2\nlínea3');
      expect(lines).toEqual(['línea1', 'línea2', 'línea3']);
    });

    it('retorna un solo elemento si no hay saltos de línea', () => {
      expect(component.answerLines('única línea')).toEqual(['única línea']);
    });
  });

  describe('navegación completa por la UI', () => {
    it('muestra los temas y al seleccionar uno muestra su respuesta', () => {
      fixture.detectChanges();
      fixture.nativeElement.querySelector('.chat-fab').click();
      fixture.detectChanges();

      const topicBtns = fixture.nativeElement.querySelectorAll('.topic-btn');
      expect(topicBtns.length).toBe(component.faqs.length);

      topicBtns[0].click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.answer-bubble')).toBeTruthy();
    });
  });
});
