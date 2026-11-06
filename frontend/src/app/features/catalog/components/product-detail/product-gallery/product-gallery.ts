import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { IMAGE_FALLBACK } from '@shared/utils/image';

/** Galería de imágenes del producto: imagen principal + miniaturas. */
@Component({
  selector: 'app-product-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-gallery.html',
  styleUrl: './product-gallery.scss',
})
export class ProductGallery {
  readonly images = input.required<readonly string[]>();
  readonly productName = input.required<string>();
  readonly discount = input<number | undefined>();

  protected readonly selectedIndex = signal(0);
  protected readonly selectedImage = computed(() => this.images()[this.selectedIndex()] ?? IMAGE_FALLBACK);

  constructor() {
    // Al cambiar el set de imágenes (p. ej. otro color) se vuelve a la primera.
    effect(() => {
      this.images();
      this.selectedIndex.set(0);
    });
  }

  protected useFallback(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith(IMAGE_FALLBACK)) img.src = IMAGE_FALLBACK;
  }
}
