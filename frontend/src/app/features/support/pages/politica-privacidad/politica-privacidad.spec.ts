import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PoliticaPrivacidadPage } from './politica-privacidad';

describe('PoliticaPrivacidadPage', () => {
  const render = () => {
    const fixture = TestBed.createComponent(PoliticaPrivacidadPage);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PoliticaPrivacidadPage], providers: [provideRouter([])] });
  });

  it('renderiza el índice con 10 secciones enlazadas por ancla', () => {
    const { el } = render();
    const links = el.querySelectorAll('.toc a');
    expect(links).toHaveLength(10);
    expect(links[0].getAttribute('href')).toContain('#responsable');
  });

  it('marca como activa la primera sección y cambia al hacer clic', () => {
    const { fixture, el } = render();
    expect(el.querySelector('.toc a.active')!.getAttribute('href')).toContain('#responsable');
    const second = el.querySelectorAll<HTMLAnchorElement>('.toc a')[1];
    second.click();
    fixture.detectChanges();
    expect(second.classList).toContain('active');
  });

  it('proyecta el contenido legal con un único h1', () => {
    const { el } = render();
    expect(el.querySelectorAll('h1')).toHaveLength(1);
    expect(el.querySelector('#responsable')).toBeTruthy();
  });
});
