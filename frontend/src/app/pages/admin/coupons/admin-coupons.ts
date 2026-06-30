import type { OnInit} from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CouponService } from '../../../core/services/coupon.service';
import { CurrencyPenPipe } from '../../../shared/pipes';

interface Coupon {
  id: number;
  code: string;
  discount: number;
  isPercent: boolean;
  minAmount: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPenPipe],
  templateUrl: './admin-coupons.html',
  styleUrl: './admin-coupons.scss',
})
export class AdminCouponsPage implements OnInit {
  private couponSvc = inject(CouponService);

  coupons  = signal<Coupon[]>([]);
  loading  = signal(true);
  saving   = signal(false);
  error    = signal('');
  showForm = signal(false);

  form = this.emptyForm();

  readonly PAGE_SIZE = 6;
  currentPage = signal(1);

  pagedCoupons = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.coupons().slice(start, start + this.PAGE_SIZE);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.coupons().length / this.PAGE_SIZE)));

  visiblePages = computed(() => {
    const cur = this.currentPage();
    const end = Math.min(cur + 2, this.totalPages());
    return Array.from({ length: end - cur + 1 }, (_, i) => cur + i);
  });

  showEllipsis = computed(() => this.currentPage() + 2 < this.totalPages());

  ngOnInit() { this.load(); }

  private load() {
    this.loading.set(true);
    this.couponSvc.getAll().subscribe({
      next:  (c) => { this.coupons.set(c as Coupon[]); this.currentPage.set(1); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private emptyForm() {
    return {
      code:      '',
      discount:  10,
      isPercent: true,
      minAmount: 0,
      maxUses:   100,
      expiresAt: '',
    };
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  openForm()  { this.form = this.emptyForm(); this.showForm.set(true); this.error.set(''); }
  closeForm() { this.showForm.set(false); }

  save() {
    if (!this.form.code.trim()) { this.error.set('El código es obligatorio.'); return; }
    this.saving.set(true);
    this.error.set('');
    const payload = {
      ...this.form,
      code:      this.form.code.trim().toUpperCase(),
      expiresAt: this.form.expiresAt || undefined,
    };
    this.couponSvc.create(payload).subscribe({
      next: () => { this.load(); this.showForm.set(false); this.saving.set(false); },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al crear el cupón.');
        this.saving.set(false);
      },
    });
  }

  toggle(coupon: Coupon) {
    this.couponSvc.toggle(coupon.id).subscribe({
      next: (updated: any) => {
        this.coupons.update(list =>
          list.map(c => c.id === coupon.id ? { ...c, active: updated.active } : c)
        );
      },
    });
  }

  remove(coupon: Coupon) {
    if (!confirm(`¿Eliminar el cupón "${coupon.code}"?`)) return;
    this.couponSvc.delete(coupon.id).subscribe({ next: () => this.load() });
  }
}
