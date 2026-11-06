import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SITE_CONFIG } from '@core/config/site.config';
import type { Product } from '@core/models/product.model';
import { CurrencyPenPipe } from '@shared/pipes';
import { discountedPrice, installmentAmount } from '@shared/utils/pricing';

/** Bloque de precio: precio final, descuento y cuotas sin interés. */
@Component({
  selector: 'app-product-price',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPenPipe],
  templateUrl: './product-price.html',
  styleUrl: './product-price.scss',
})
export class ProductPrice {
  readonly product = input.required<Product>();

  protected readonly installments = SITE_CONFIG.installments;
  protected readonly finalPrice = computed(() => discountedPrice(this.product()));
  protected readonly installment = computed(() =>
    installmentAmount(this.finalPrice(), this.installments.count),
  );
}
