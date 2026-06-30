import type { OnInit} from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReclamacionService } from '../../../core/services/reclamacion.service';
import type {
  Reclamacion, ReclamacionEstado} from '../../../core/models/reclamacion.model';
import {
  ESTADO_LABELS, ESTADO_COLORS, TIPO_LABELS, TIPO_COLORS,
} from '../../../core/models/reclamacion.model';

@Component({
  selector: 'app-admin-reclamaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-reclamaciones.html',
  styleUrl:    './admin-reclamaciones.scss',
})
export class AdminReclamacionesPage implements OnInit {
  private service = inject(ReclamacionService);

  all       = signal<Reclamacion[]>([]);
  loading   = signal(true);
  updating  = signal<number | null>(null);
  expanded  = signal<number | null>(null);
  filter    = signal<ReclamacionEstado | 'TODOS'>('TODOS');

  // Per-card state
  respuestas:      Record<number, string>              = {};
  selectedEstados: Record<number, ReclamacionEstado>   = {};
  toast     = signal('');
  errorId   = signal<number | null>(null);
  errorMsg  = signal('');

  ESTADO_LABELS = ESTADO_LABELS;
  ESTADO_COLORS = ESTADO_COLORS;
  TIPO_LABELS   = TIPO_LABELS;
  TIPO_COLORS   = TIPO_COLORS;

  readonly FILTERS: { value: ReclamacionEstado | 'TODOS'; label: string }[] = [
    { value: 'TODOS',       label: 'Todos'       },
    { value: 'PENDIENTE',   label: 'Pendiente'   },
    { value: 'EN_REVISION', label: 'En revisión' },
    { value: 'RESUELTO',    label: 'Resuelto'    },
    { value: 'CERRADO',     label: 'Cerrado'     },
  ];

  readonly ESTADO_OPTIONS: ReclamacionEstado[] = [
    'PENDIENTE', 'EN_REVISION', 'RESUELTO', 'CERRADO',
  ];

  filtered = computed(() => {
    const f = this.filter();
    return f === 'TODOS' ? this.all() : this.all().filter(r => r.estado === f);
  });

  counts = computed(() => ({
    TODOS:       this.all().length,
    PENDIENTE:   this.all().filter(r => r.estado === 'PENDIENTE').length,
    EN_REVISION: this.all().filter(r => r.estado === 'EN_REVISION').length,
    RESUELTO:    this.all().filter(r => r.estado === 'RESUELTO').length,
    CERRADO:     this.all().filter(r => r.estado === 'CERRADO').length,
  }));

  ngOnInit() {
    this.service.getAll().subscribe({
      next:  r => { this.all.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  toggleExpand(id: number, rec: Reclamacion) {
    if (this.expanded() === id) {
      this.expanded.set(null);
    } else {
      this.expanded.set(id);
      if (!(id in this.respuestas))      this.respuestas[id]      = rec.respuesta ?? '';
      if (!(id in this.selectedEstados)) this.selectedEstados[id] = rec.estado;
    }
  }

  save(rec: Reclamacion) {
    const estado    = this.selectedEstados[rec.id] ?? rec.estado;
    const respuesta = this.respuestas[rec.id];

    this.updating.set(rec.id);
    this.errorId.set(null);

    this.service.updateEstado(rec.id, estado, respuesta).subscribe({
      next: updated => {
        this.all.update(list => list.map(r => r.id === rec.id ? { ...r, ...updated } : r));
        this.selectedEstados[rec.id] = updated.estado;
        this.updating.set(null);
        this.expanded.set(null);
        this.toast.set('Cambios guardados correctamente');
        setTimeout(() => this.toast.set(''), 3500);
      },
      error: (err) => {
        const detail = err?.error?.message;
        this.errorMsg.set(
          Array.isArray(detail) ? detail.join(' · ')
          : detail ?? 'Error al guardar. Inténtalo nuevamente.'
        );
        this.errorId.set(rec.id);
        this.updating.set(null);
      },
    });
  }
}
