import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CurrencyPenPipe, OrderStatusPipe } from '../../shared/pipes';

const PAGE_SIZE = 3;

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, CommonModule, CurrencyPenPipe, OrderStatusPipe],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminPage implements OnInit {
  private productService = inject(ProductService);

  stats = signal<{
    totalProducts: number;
    lowStock: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: any[];
  } | null>(null);

  loading = signal(true);
  currentPage = signal(1);

  totalPages = computed(() =>
    Math.ceil((this.stats()?.recentOrders.length ?? 0) / PAGE_SIZE)
  );

  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  pagedOrders = computed(() => {
    const orders = this.stats()?.recentOrders ?? [];
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  });

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  ngOnInit() {
    this.productService.getStats().subscribe({
      next: (s) => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
