import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CouponService } from '../../../core/services/coupon.service';

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
  imports: [CommonModule, FormsModule, RouterLink],
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

  ngOnInit() { this.load(); }

  private load() {
    this.loading.set(true);
    this.couponSvc.getAll().subscribe({
      next:  (c) => { this.coupons.set(c as Coupon[]); this.loading.set(false); },
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
