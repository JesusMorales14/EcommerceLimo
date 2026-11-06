import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';

export interface GeoPoint {
  readonly lat: number;
  readonly lng: number;
}

export interface GeocodingResult extends GeoPoint {
  readonly address: string;
}

interface NominatimSearchItem {
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimReverse {
  display_name?: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

/** Adaptador sobre la API pública de Nominatim (OpenStreetMap). */
@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);

  /** Busca la primera coincidencia de una dirección. */
  search(query: string): Observable<GeocodingResult | null> {
    return this.http
      .get<NominatimSearchItem[]>(`${NOMINATIM_URL}/search`, {
        params: { q: query, format: 'json', limit: 1, countrycodes: 'pe' },
      })
      .pipe(
        map(([first]) =>
          first ? { lat: Number(first.lat), lng: Number(first.lon), address: first.display_name } : null,
        ),
      );
  }

  /** Obtiene la dirección legible de unas coordenadas. */
  reverse({ lat, lng }: GeoPoint): Observable<string | null> {
    return this.http
      .get<NominatimReverse>(`${NOMINATIM_URL}/reverse`, { params: { lat, lon: lng, format: 'json' } })
      .pipe(map((res) => res.display_name ?? null));
  }
}
