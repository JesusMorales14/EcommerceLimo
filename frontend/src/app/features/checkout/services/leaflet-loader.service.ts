import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import type * as Leaflet from 'leaflet';

export type LeafletModule = typeof Leaflet;

const LEAFLET_CSS_ID = 'leaflet-css';
const LEAFLET_CSS_HREF = 'leaflet.css';
const LEAFLET_IMAGES_PATH = 'leaflet/images/';

/**
 * Carga Leaflet bajo demanda (code splitting): el JS y el CSS del mapa solo se
 * descargan cuando el usuario llega al paso de entrega del checkout.
 */
@Injectable({ providedIn: 'root' })
export class LeafletLoaderService {
  private readonly document = inject(DOCUMENT);
  private leaflet?: Promise<LeafletModule>;

  load(): Promise<LeafletModule> {
    this.leaflet ??= Promise.all([import('leaflet'), this.loadStyles()]).then(([module]) => {
      const L = (module as { default?: LeafletModule }).default ?? module;
      L.Icon.Default.imagePath = LEAFLET_IMAGES_PATH;
      return L;
    });
    return this.leaflet;
  }

  private loadStyles(): Promise<void> {
    if (this.document.getElementById(LEAFLET_CSS_ID)) return Promise.resolve();
    return new Promise((resolve) => {
      const link = this.document.createElement('link');
      link.id = LEAFLET_CSS_ID;
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS_HREF;
      link.onload = () => resolve();
      link.onerror = () => resolve();
      this.document.head.appendChild(link);
    });
  }
}
