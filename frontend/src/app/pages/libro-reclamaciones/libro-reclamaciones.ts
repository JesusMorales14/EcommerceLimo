import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReclamacionService } from '../../core/services/reclamacion.service';
import { Reclamacion } from '../../core/models/reclamacion.model';

@Component({
  selector: 'app-libro-reclamaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './libro-reclamaciones.html',
  styleUrl: './libro-reclamaciones.scss',
})
export class LibroReclamacionesPage {
  private reclamacionService = inject(ReclamacionService);

  submitted  = signal(false);
  submitting = signal(false);
  submitted_rec = signal<Reclamacion | null>(null);
  error      = signal('');

  form = {
    nombre: '', apellidos: '', dni: '', email: '',
    telefono: '', direccion: '', tipo: 'RECLAMO',
    bien: 'PRODUCTO', pedidoNum: '', detalle: '', accion: '', acepta: false,
  };

  isFormValid(): boolean {
    return !!(
      this.form.nombre.trim() && this.form.apellidos.trim() &&
      this.form.dni.trim()    && this.form.email.trim()     &&
      this.form.telefono.trim() && this.form.detalle.trim() &&
      this.form.acepta
    );
  }

  submit() {
    if (!this.isFormValid()) return;
    this.submitting.set(true);
    this.error.set('');
    const { acepta, ...payload } = this.form;
    this.reclamacionService.create(payload as any).subscribe({
      next: (rec) => {
        this.submitted_rec.set(rec);
        this.submitted.set(true);
        this.submitting.set(false);
      },
      error: (err) => {
        const detail = err?.error?.message;
        const msg = err?.status === 0
          ? 'No se pudo conectar con el servidor. Verifica que el backend esté activo.'
          : Array.isArray(detail) ? detail.join(' · ')
          : detail ?? `Error ${err?.status ?? ''}: Ocurrió un error al enviar tu reclamación. Inténtalo nuevamente.`;
        this.error.set(msg);
        this.submitting.set(false);
      },
    });
  }

  reset() {
    this.submitted.set(false);
    this.submitted_rec.set(null);
    this.error.set('');
    this.form = {
      nombre: '', apellidos: '', dni: '', email: '',
      telefono: '', direccion: '', tipo: 'RECLAMO',
      bien: 'PRODUCTO', pedidoNum: '', detalle: '', accion: '', acepta: false,
    };
  }
}
