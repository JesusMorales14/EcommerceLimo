import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { ChatSupport } from './chat-support';

describe('ChatSupport', () => {
  let fixture: ComponentFixture<ChatSupport>;
  let component: ChatSupport;
  let el: HTMLElement;

  const click = (selector: string, index = 0) => {
    el.querySelectorAll<HTMLButtonElement>(selector)[index].click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatSupport);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('inicia cerrado', () => {
    expect(component.isOpen()).toBe(false);
    expect(el.querySelector('.chat-panel')).toBeNull();
  });

  it('abre el panel con los temas y actualiza aria-expanded', () => {
    click('.chat-fab');
    expect(el.querySelector('.chat-fab')!.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelectorAll('.topic-btn')).toHaveLength(component.topics.length);
  });

  it('muestra la respuesta del tema elegido y permite volver', () => {
    click('.chat-fab');
    click('.topic-btn', 1);
    expect(el.querySelector('.chat-question-header')!.textContent).toContain(component.topics[1].label);
    expect(el.querySelectorAll('.answer-bubble p').length).toBeGreaterThan(1);

    click('.chat-back');
    expect(component.activeTopic()).toBeNull();
    expect(component.isOpen()).toBe(true);
  });

  it('cerrar limpia el tema activo', () => {
    click('.chat-fab');
    click('.topic-btn');
    click('.chat-close');
    expect(component.isOpen()).toBe(false);
    expect(component.activeTopic()).toBeNull();
  });
});
