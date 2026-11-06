import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE_CONFIG } from '@core/config/site.config';

/** Opciones de entrega y sellos de confianza (contenido estático de la tienda). */
@Component({
  selector: 'app-product-delivery-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-delivery-info.html',
  styleUrl: './product-delivery-info.scss',
})
export class ProductDeliveryInfo {
  protected readonly deliveryOptions = SITE_CONFIG.delivery;
  protected readonly trustItems = SITE_CONFIG.trust;
}
