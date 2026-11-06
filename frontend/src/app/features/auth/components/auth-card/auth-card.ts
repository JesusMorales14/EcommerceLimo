import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SITE_CONFIG } from '@core/config/site.config';

/**
 * Layout común de las pantallas de autenticación.
 * Proyecta el formulario (contenido por defecto) y el pie (`[authFooter]`).
 */
@Component({
  selector: 'app-auth-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-card.html',
  styleUrl: './auth-card.scss',
})
export class AuthCard {
  readonly heading = input.required<string>();
  readonly subtitle = input('');
  readonly error = input('');

  protected readonly storeName = SITE_CONFIG.storeName;
}
