import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReclamacionService } from '../../core/services/reclamacion.service';
import {
  Reclamacion, ReclamacionEstado,
  ESTADO_LABELS, ESTADO_COLORS, TIPO_LABELS, TIPO_COLORS, ESTADO_ORDER,
} from '../../core/models/reclamacion.model';

interface TimelineStep {
  estado: ReclamacionEstado;
  label:  string;
  icon:   string;
}

@Component({
  selector: 'app-mis-reclamaciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-reclamaciones.html',
  styleUrl:    './mis-reclamaciones.scss',
})
export class MisReclamacionesPage implements OnInit {
  private service = inject(ReclamacionService);

  reclamaciones = signal<Reclamacion[]>([]);
  loading       = signal(true);
  expanded      = signal<number | null>(null);

  ESTADO_LABELS = ESTADO_LABELS;
  ESTADO_COLORS = ESTADO_COLORS;
  TIPO_LABELS   = TIPO_LABELS;
  TIPO_COLORS   = TIPO_COLORS;

  readonly TIMELINE: TimelineStep[] = [
    { estado: 'PENDIENTE',   label: 'Pendiente',    icon: 'schedule'       },
    { estado: 'EN_REVISION', label: 'En revisión',  icon: 'manage_search'  },
    { estado: 'RESUELTO',    label: 'Resuelto',     icon: 'check_circle'   },
    { estado: 'CERRADO',     label: 'Cerrado',      icon: 'lock'           },
  ];

  ngOnInit() {
    this.service.getMine().subscribe({
      next:  r => { this.reclamaciones.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  isStepDone(current: ReclamacionEstado, step: ReclamacionEstado): boolean {
    return ESTADO_ORDER.indexOf(current) > ESTADO_ORDER.indexOf(step);
  }

  isStepActive(current: ReclamacionEstado, step: ReclamacionEstado): boolean {
    return current === step;
  }

  toggleExpand(id: number) {
    this.expanded.update(v => v === id ? null : id);
  }
}
