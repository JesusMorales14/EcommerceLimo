import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReclamacionService } from '../../core/services/reclamacion.service';
import type { Reclamacion, ReclamacionBien, ReclamacionTipo } from '../../core/models/reclamacion.model';

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

  touched = new Set<string>();

  form: {
    nombre: string; apellidos: string; dni: string; email: string;
    telefono: string; direccion: string; tipo: ReclamacionTipo;
    bien: ReclamacionBien; pedidoNum: string; detalle: string; accion: string; acepta: boolean;
  } = {
    nombre: '', apellidos: '', dni: '', email: '',
    telefono: '', direccion: '', tipo: 'RECLAMO',
    bien: 'PRODUCTO', pedidoNum: '', detalle: '', accion: '', acepta: false,
  };

  touch(field: string) {
    this.touched.add(field);
  }

  getError(field: string): string {
    if (!this.touched.has(field)) return '';
    switch (field) {
      case 'nombre':
        return !this.form.nombre.trim() ? 'El nombre es requerido.' : '';
      case 'apellidos':
        return !this.form.apellidos.trim() ? 'Los apellidos son requeridos.' : '';
      case 'dni':
        if (!this.form.dni.trim()) return 'El DNI / CE es requerido.';
        if (!/^\d{7,12}$/.test(this.form.dni.trim())) return 'Debe contener entre 7 y 12 dígitos numéricos.';
        return '';
      case 'email':
        if (!this.form.email.trim()) return 'El correo electrónico es requerido.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim())) return 'Ingresa un correo electrónico válido.';
        return '';
      case 'telefono':
        if (!this.form.telefono.trim()) return 'El teléfono es requerido.';
        if (!/^[\d\s+\-()]{7,15}$/.test(this.form.telefono.trim())) return 'Ingresa un número de teléfono válido.';
        return '';
      case 'detalle':
        if (!this.form.detalle.trim()) return 'La descripción es requerida.';
        if (this.form.detalle.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres.';
        return '';
      default:
        return '';
    }
  }

  hasError(field: string): boolean {
    return this.getError(field) !== '';
  }

  isFormValid(): boolean {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim());
    const dniValid   = /^\d{7,12}$/.test(this.form.dni.trim());
    const telValid   = /^[\d\s+\-()]{7,15}$/.test(this.form.telefono.trim());
    return !!(
      this.form.nombre.trim()    &&
      this.form.apellidos.trim() &&
      dniValid                   &&
      emailValid                 &&
      telValid                   &&
      this.form.detalle.trim().length >= 10 &&
      this.form.acepta
    );
  }

  submit() {
    // Touch all validated fields to show errors
    ['nombre', 'apellidos', 'dni', 'email', 'telefono', 'detalle'].forEach(f => this.touched.add(f));
    if (!this.isFormValid()) return;
    this.submitting.set(true);
    this.error.set('');
    const { acepta: _, ...payload } = this.form;
    this.reclamacionService.create(payload).subscribe({
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
    this.touched.clear();
    this.form = {
      nombre: '', apellidos: '', dni: '', email: '',
      telefono: '', direccion: '', tipo: 'RECLAMO',
      bien: 'PRODUCTO', pedidoNum: '', detalle: '', accion: '', acepta: false,
    };
  }
}
