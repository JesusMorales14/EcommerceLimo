import { Component, signal, AfterViewInit, OnDestroy } from '@angular/core';

const SECTIONS = ['responsable', 'datos', 'finalidad', 'base', 'conservacion', 'derechos', 'terceros', 'cookies', 'seguridad', 'contacto'];

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [],
  templateUrl: './politica-privacidad.html',
  styleUrl: './politica-privacidad.scss',
})
export class PoliticaPrivacidadPage implements AfterViewInit, OnDestroy {
  activeSection = signal(SECTIONS[0]);
  private observer?: IntersectionObserver;

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activeSection.set(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-120px 0px -65% 0px', threshold: 0 }
    );
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) this.observer.observe(el);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  scrollTo(id: string) {
    this.activeSection.set(id);
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
