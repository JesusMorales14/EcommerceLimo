import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

/**
 * Abstracción de los diálogos de confirmación. Hoy usa `window.confirm`;
 * centralizarlo permite reemplazarlo por un modal propio sin tocar las páginas
 * y simplifica las pruebas (se puede sustituir por un doble).
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly window = inject(DOCUMENT).defaultView;

  confirm(message: string): boolean {
    return this.window?.confirm(message) ?? false;
  }
}
