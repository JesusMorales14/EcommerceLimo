import { Injectable } from '@angular/core';
import type { PreloadingStrategy, Route } from '@angular/router';
import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs';

/** Marca una ruta para que NO se precargue (p. ej. el panel de administración). */
export const NO_PRELOAD = { preload: false } as const;

/**
 * Precarga en segundo plano las rutas diferidas, salvo las marcadas con
 * `data: { preload: false }` y las conexiones lentas o con ahorro de datos.
 * Así los clientes no descargan código que nunca usarán (admin).
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (route.data?.['preload'] === false || this.isConstrainedNetwork()) return EMPTY;
    return load();
  }

  private isConstrainedNetwork(): boolean {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    return !!connection && (connection.saveData === true || /(^|-)2g$/.test(connection.effectiveType ?? ''));
  }
}
