import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { splitList } from '../../data/product-form';

/**
 * Editor de colores del producto y de las URLs de imágenes de cada color.
 * Sin colores, permite ingresar imágenes genéricas.
 */
@Component({
  selector: 'app-color-images-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './color-images-editor.html',
  styleUrl: './color-images-editor.scss',
})
export class ColorImagesEditor {
  /** Colores separados por coma. */
  readonly colors = model('');
  /** Imágenes genéricas separadas por coma (cuando no hay colores). */
  readonly images = model('');
  /** URLs por color (texto separado por coma). */
  readonly colorImages = model<Record<string, string>>({});

  protected readonly parsedColors = computed(() => splitList(this.colors()));

  protected setColorImages(color: string, urls: string): void {
    this.colorImages.update((current) => ({ ...current, [color]: urls }));
  }
}
