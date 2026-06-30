import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'theme';

  isDark = signal(false);

  constructor() {
    const saved = this.readSaved();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.apply(saved === 'dark' || (!saved && prefersDark));
  }

  toggle() { this.apply(!this.isDark()); }

  private apply(dark: boolean) {
    this.isDark.set(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    try { localStorage.setItem(this.KEY, dark ? 'dark' : 'light'); } catch { /* storage unavailable */ }
  }

  private readSaved(): string | null {
    try { return localStorage.getItem(this.KEY); } catch { return null; }
  }
}
