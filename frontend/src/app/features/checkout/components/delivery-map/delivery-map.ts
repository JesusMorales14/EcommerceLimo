import type { ElementRef } from '@angular/core';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, viewChild } from '@angular/core';
import type { LeafletMouseEvent, Map as LeafletMap, Marker } from 'leaflet';
import type { LeafletModule } from '../../services/leaflet-loader.service';
import type { GeoPoint } from '../../services/geocoding.service';
import { LeafletLoaderService } from '../../services/leaflet-loader.service';

/** Centro por defecto del mapa: Lima, Perú. */
const DEFAULT_CENTER: GeoPoint = { lat: -12.0464, lng: -77.0428 };
const DEFAULT_ZOOM = 13;
const LOCATED_ZOOM = 16;
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '© <a href="https://openstreetmap.org">OpenStreetMap</a>';

/** Mapa interactivo (Leaflet) para marcar el punto de entrega. */
@Component({
  selector: 'app-delivery-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delivery-map.html',
  styleUrl: './delivery-map.scss',
})
export class DeliveryMap {
  /** Punto marcado actualmente (si existe). */
  readonly location = input<GeoPoint | null>(null);
  readonly locationPicked = output<GeoPoint>();

  private readonly loader = inject(LeafletLoaderService);
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('mapContainer');
  private map?: LeafletMap;
  private marker?: Marker;
  private leaflet?: LeafletModule;

  constructor() {
    afterNextRender(() => void this.initMap());
    inject(DestroyRef).onDestroy(() => this.map?.remove());
  }

  /** Centra el mapa y coloca el marcador en un punto (p. ej. tras buscar una dirección). */
  focus(point: GeoPoint): void {
    this.map?.setView([point.lat, point.lng], LOCATED_ZOOM);
    this.placeMarker(point);
  }

  private async initMap(): Promise<void> {
    this.leaflet = await this.loader.load();
    const L = this.leaflet;
    const start = this.location() ?? DEFAULT_CENTER;

    this.map = L.map(this.container().nativeElement).setView([start.lat, start.lng], DEFAULT_ZOOM);
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(this.map);
    this.map.on('click', (event: LeafletMouseEvent) => {
      const point = { lat: event.latlng.lat, lng: event.latlng.lng };
      this.placeMarker(point);
      this.locationPicked.emit(point);
    });

    const current = this.location();
    if (current) {
      this.focus(current);
    } else {
      this.centerOnUserPosition();
    }
  }

  private centerOnUserPosition(): void {
    navigator.geolocation?.getCurrentPosition(({ coords }) =>
      this.map?.setView([coords.latitude, coords.longitude], LOCATED_ZOOM - 1),
    );
  }

  private placeMarker(point: GeoPoint): void {
    if (!this.map || !this.leaflet) return;
    this.marker?.remove();
    this.marker = this.leaflet.marker([point.lat, point.lng]).addTo(this.map);
  }
}
