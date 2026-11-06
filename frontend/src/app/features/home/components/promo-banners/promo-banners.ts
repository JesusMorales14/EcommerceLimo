import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface PromoBanner {
  readonly tag: string;
  readonly title: string;
  readonly cta: string;
  readonly categoryId: string;
  readonly variant: 'green' | 'dark';
}

/** Banners promocionales que enlazan a categorías. */
@Component({
  selector: 'app-promo-banners',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './promo-banners.html',
  styleUrl: './promo-banners.scss',
})
export class PromoBanners {
  protected readonly banners: readonly PromoBanner[] = [
    { tag: 'TECNOLOGÍA', title: 'Hasta 40% off en electrónica', cta: 'Comprar ahora →', categoryId: 'tecnologia', variant: 'green' },
    { tag: 'MODA', title: 'Nueva colección de temporada', cta: 'Explorar →', categoryId: 'moda-mujer', variant: 'dark' },
  ];
}
