import { TestBed } from '@angular/core/testing';
import { StarRating } from './star-rating';

describe('StarRating', () => {
  const render = (value: number) => {
    const fixture = TestBed.createComponent(StarRating);
    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('span') as HTMLSpanElement;
  };

  it('redondea y completa con estrellas vacías', () => {
    const span = render(3.6);
    expect(span.textContent).toBe('★★★★☆');
    expect(span.getAttribute('aria-label')).toBe('Valoración: 4 de 5 estrellas');
  });

  it('acota los valores fuera de rango', () => {
    expect(render(-2).textContent).toBe('☆☆☆☆☆');
    expect(render(9).textContent).toBe('★★★★★');
  });
});
