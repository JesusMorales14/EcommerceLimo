import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

interface BrandCard {
  name: string;
  image: string;
  altImage: string;
  description: string;
  count: number;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchPage implements OnInit {
  private productService = inject(ProductService);
  private route          = inject(ActivatedRoute);

  query   = signal('');
  loading = signal(false);

  private all = signal<Product[]>([]);

  brandCards = computed<BrandCard[]>(() => {
    const q   = this.query().toLowerCase().trim();
    const map = new Map<string, BrandCard>();

    for (const p of this.all()) {
      if (q) {
        const hit =
          p.brand.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q)  ||
          p.description.toLowerCase().includes(q);
        if (!hit) continue;
      }

      if (!map.has(p.brand)) {
        map.set(p.brand, {
          name:        p.brand,
          image:       p.images[0] ?? '',
          altImage:    p.images[1] ?? '',
          description: p.description,
          count:       1,
        });
      } else {
        map.get(p.brand)!.count++;
      }
    }

    return Array.from(map.values());
  });

  total = computed(() => this.brandCards().length);

  ngOnInit() {
    this.load();
    this.route.queryParams.subscribe(params => this.query.set(params['q'] ?? ''));
  }

  private load() {
    this.loading.set(true);
    this.productService.getFeatured(100).subscribe({
      next: (res) => { this.all.set(res.items); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }
}
