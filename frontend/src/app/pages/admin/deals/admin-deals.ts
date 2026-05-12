import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
export class AdminDealsPage implements OnInit, OnDestroy {
  private dealService    = inject(DealSessionService);
  private productService = inject(ProductService);

  session    = signal<DealSession | null>(null);
  scheduled  = signal<DealSession | null>(null);
  offers     = signal<Product[]>([]);
  loading    = signal(true);
  saving     = signal(false);
  error      = signal('');
  success    = signal('');

  remainingStr  = signal('--:--:--');
  startsInStr   = signal('--:--:--');

  private timerId: ReturnType<typeof setInterval> | null = null;

  startsAtInput = '';
  endsAtInput   = '';

  ngOnInit() { this.load(); }

  ngOnDestroy() { this.clearTimer(); }

  private load() {
    this.loading.set(true);
    this.dealService.getActive().subscribe({
      next: (s) => {
        this.session.set(s);
        this.loading.set(false);
        if (s) this.startCountdowns(new Date(s.endsAt), null);
      },
      error: () => this.loading.set(false),
    });
    this.dealService.getScheduled().subscribe(s => {
      this.scheduled.set(s);
      if (s && !this.session()) this.startCountdowns(null, new Date(s.startsAt));
    });
    this.productService.getOffers().subscribe(res => this.offers.set(res.items));
  }

  private startCountdowns(endsAt: Date | null, startsAt: Date | null) {
    this.clearTimer();
    const tick = () => {
      const now = Date.now();
      if (endsAt) {
        const diff = endsAt.getTime() - now;
        this.remainingStr.set(diff <= 0 ? 'Expirada' : this.fmt(diff));
      }
      if (startsAt) {
        const diff = startsAt.getTime() - now;
        this.startsInStr.set(diff <= 0 ? '¡Ahora!' : this.fmt(diff));
      }
    };
    tick();
    this.timerId = setInterval(tick, 1000);
  }

  private fmt(ms: number): string {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1_000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  private clearTimer() {
    if (this.timerId !== null) { clearInterval(this.timerId); this.timerId = null; }
  }

  remainingLabel(): string { return this.remainingStr(); }

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
    const isScheduled = !this.session() && this.scheduled();
    const msg = isScheduled ? '¿Cancelar la sesión programada?' : '¿Cancelar la oferta activa?';
    if (!confirm(msg)) return;
    this.dealService.cancel().subscribe(() => {
      this.session.set(null);
      this.scheduled.set(null);
      this.clearTimer();
      this.success.set(isScheduled ? 'Sesión programada cancelada.' : 'Oferta cancelada.');
    });
  }
}
