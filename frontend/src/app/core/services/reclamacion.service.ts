import { inject, Injectable } from '@angular/core';
import type { Reclamacion, ReclamacionEstado } from '../models/reclamacion.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ReclamacionService {
  private api = inject(ApiService);

  create(data: Partial<Reclamacion>) {
    return this.api.post<Reclamacion>('/reclamaciones', data);
  }

  getMine() {
    return this.api.get<Reclamacion[]>('/reclamaciones/mine');
  }

  getAll() {
    return this.api.get<Reclamacion[]>('/reclamaciones/all');
  }

  updateEstado(id: number, estado: ReclamacionEstado, respuesta?: string) {
    return this.api.patch<Reclamacion>(`/reclamaciones/${id}/estado`, { estado, respuesta });
  }
}
