import { inject, Injectable } from '@angular/core';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TitleStrategy } from '@angular/router';
import type { RouteSeoData } from './seo.model';
import { SeoService } from './seo.service';

/**
 * Estrategia de título que, además del `<title>`, aplica los metadatos SEO
 * declarados en `route.data.seo` de toda la jerarquía de rutas activa.
 * Las páginas con datos dinámicos (p. ej. detalle de producto) pueden
 * sobrescribirlos llamando a `SeoService.update()`.
 */
@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    if (title === undefined) return; // la página gestiona su propio SEO
    this.seo.setJsonLd(null);
    this.seo.update({ title, ...this.collectSeoData(snapshot.root) });
  }

  private collectSeoData(route: ActivatedRouteSnapshot | null): RouteSeoData {
    let merged: RouteSeoData = {};
    for (let current = route; current; current = current.firstChild) {
      const data = current.data['seo'] as RouteSeoData | undefined;
      if (data) merged = { ...merged, ...data };
    }
    return merged;
  }
}
