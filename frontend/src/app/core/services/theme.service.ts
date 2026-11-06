import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

interface ViewTransitionDocument {
  startViewTransition(callback: () => void): { ready: Promise<void> };
}

const STORAGE_KEY = 'theme';
const TRANSITION_MS = 450;

/** Gestiona el tema claro/oscuro y su persistencia. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly isDark = signal(false);

  constructor() {
    const saved = this.readSaved();
    const prefersDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    this.apply(saved === 'dark' || (!saved && prefersDark));
  }

  toggle(): void {
    this.apply(!this.isDark());
  }

  /**
   * Cambia el tema con una animación circular (View Transitions API) que nace
   * desde la posición del clic. Degrada a un cambio instantáneo si el navegador
   * no soporta la API o el usuario prefiere movimiento reducido.
   */
  toggleWithTransition(event?: MouseEvent): void {
    const view = this.document.defaultView;
    if (!view || !this.canAnimate(view)) {
      this.toggle();
      return;
    }

    const x = event?.clientX ?? view.innerWidth - 32;
    const y = event?.clientY ?? 32;
    const radius = Math.hypot(Math.max(x, view.innerWidth - x), Math.max(y, view.innerHeight - y));

    const transition = (this.document as unknown as ViewTransitionDocument).startViewTransition(() =>
      this.toggle(),
    );
    void transition.ready.then(() => {
      this.document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: TRANSITION_MS, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
      );
    });
  }

  private canAnimate(view: Window): boolean {
    const reduceMotion = view.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    return !reduceMotion && 'startViewTransition' in this.document;
  }

  private apply(dark: boolean): void {
    const theme: Theme = dark ? 'dark' : 'light';
    this.isDark.set(dark);
    this.document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* almacenamiento no disponible (modo privado) */
    }
  }

  private readSaved(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
