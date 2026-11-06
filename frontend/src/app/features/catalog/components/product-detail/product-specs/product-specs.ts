import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import type { Product } from '@core/models/product.model';

/** Tabla de especificaciones del producto. */
@Component({
  selector: 'app-product-specs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TitleCasePipe],
  templateUrl: './product-specs.html',
  styleUrl: './product-specs.scss',
})
export class ProductSpecs {
  readonly product = input.required<Product>();
}
