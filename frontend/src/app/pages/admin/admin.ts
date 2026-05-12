import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, CommonModule],
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

  ngOnInit() {
    this.productService.getStats().subscribe({
      next: (s) => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
