import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Selectores de color y talla del producto. */
@Component({
  selector: 'app-product-options',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-options.html',
  styleUrl: './product-options.scss',
})
export class ProductOptions {
  readonly colors = input<readonly string[]>([]);
  readonly sizes = input<readonly string[]>([]);
  readonly selectedColor = input(0);
  readonly selectedSize = input('');

  readonly colorChange = output<number>();
  readonly sizeChange = output<string>();
}
