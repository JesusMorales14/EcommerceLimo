import type { AfterViewInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface LegalSection {
  readonly id: string;
  readonly label: string;
}

/** Margen que descuenta el header fijo al calcular la sección visible. */
const SPY_ROOT_MARGIN = '-120px 0px -65% 0px';

/**
 * Layout de páginas legales: cabecera, índice lateral con resaltado de la
 * sección visible (scroll-spy) y el contenido proyectado.
 */
@Component({
  selector: 'app-legal-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './legal-layout.html',
  styleUrl: './legal-layout.scss',
})
export class LegalLayout implements AfterViewInit {
  readonly icon = input.required<string>();
  readonly heading = input.required<string>();
  readonly description = input('');
  readonly updatedAt = input('');
  readonly sections = input.required<readonly LegalSection[]>();

  protected readonly activeSection = signal('');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    this.activeSection.set(this.sections()[0]?.id ?? '');
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) this.activeSection.set(visible.target.id);
      },
      { rootMargin: SPY_ROOT_MARGIN, threshold: 0 },
    );
    for (const { id } of this.sections()) {
      const section = this.host.nativeElement.querySelector(`#${id}`);
      if (section) observer.observe(section);
    }
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
