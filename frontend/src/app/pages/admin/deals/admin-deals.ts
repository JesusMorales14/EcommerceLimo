import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DealSessionService, DealSession } from '../../../core/services/deal-session.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-deals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-deals.html',
  styleUrl: './admin-deals.scss',
})
export class AdminDealsPage implements OnInit {
  private dealService    = inject(DealSessionService);
  private productService = inject(ProductService);

  session    = signal<DealSession | null>(null);
  offers     = signal<Product[]>([]);
  loading    = signal(true);
  saving     = signal(false);
  error      = signal('');
  success    = signal('');

  startsAtInput = '';
  endsAtInput   = '';

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.dealService.getActive().subscribe({
      next: (s) => {
        this.session.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.productService.getOffers().subscribe(res => this.offers.set(res.items));
  }

  remainingLabel(): string {
    const s = this.session();
    if (!s) return '';
    const diff = new Date(s.endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Expirada';
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const sec = Math.floor((diff % 60_000) / 1_000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  minDatetime(): string {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  activate() {
    this.error.set('');
    this.success.set('');
    if (!this.endsAtInput) { this.error.set('Selecciona una fecha y hora de fin.'); return; }
    const endsAt   = new Date(this.endsAtInput);
    const startsAt = this.startsAtInput ? new Date(this.startsAtInput) : undefined;
    if (endsAt <= new Date()) { this.error.set('La fecha de fin debe ser futura.'); return; }
    if (startsAt && startsAt >= endsAt) { this.error.set('La fecha de inicio debe ser anterior a la de fin.'); return; }
    this.saving.set(true);
    this.dealService.create(endsAt, startsAt).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set('¡Oferta activada!');
        this.startsAtInput = '';
        this.endsAtInput   = '';
        this.load();
      },
      error: () => { this.saving.set(false); this.error.set('Error al activar la oferta.'); },
    });
  }

  cancel() {
    if (!confirm('¿Cancelar la oferta activa?')) return;
    this.dealService.cancel().subscribe(() => { this.session.set(null); this.success.set('Oferta cancelada.'); });
  }
}
