import {
  ChangeDetectionStrategy, Component, computed, effect,
  inject, OnDestroy, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { SearchService } from '../../core/services/search.service';

interface BrandCard {
  name:        string;
  image:       string;
  altImage:    string;
  description: string;
  count:       number;
}

@Component({
  selector: 'app-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchPage implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private searchService  = inject(SearchService);

  loading        = signal(true);
  query          = signal('');
  sortBy         = signal<'count' | 'az'>('count');
  selectedLetter = signal('');

  private all = signal<Product[]>([]);
  private observer: IntersectionObserver | null = null;

  totalProducts = computed(() => this.all().length);

  allBrands = computed<BrandCard[]>(() => {
    const map = new Map<string, BrandCard>();
    for (const p of this.all()) {
      if (!map.has(p.brand)) {
        map.set(p.brand, {
          name:        p.brand,
          image:       p.images[0]    ?? '',
          altImage:    p.images[1]    ?? '',
          description: p.description  ?? '',
          count:       1,
        });
      } else {
        map.get(p.brand)!.count++;
      }
    }
    return Array.from(map.values());
  });

  availableLetters = computed(() =>
    [...new Set(this.allBrands().map(b => b.name[0]?.toUpperCase() ?? ''))].sort(),
  );

  brandCards = computed<BrandCard[]>(() => {
    let list = this.allBrands();

    const q = this.query().toLowerCase().trim();
    if (q) list = list.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q),
    );

    const letter = this.selectedLetter();
    if (letter) list = list.filter(b => b.name[0]?.toUpperCase() === letter);

    return this.sortBy() === 'az'
      ? [...list].sort((a, b) => a.name.localeCompare(b.name))
      : [...list].sort((a, b) => b.count - a.count);
  });

  constructor() {
    effect(() => {
      if (!this.loading()) {
        setTimeout(() => this.setupObserver(), 80);
      }
    });

    // Re-observe when filters produce new DOM nodes
    effect(() => {
      this.brandCards();
      if (!this.loading()) {
        setTimeout(() => this.setupObserver(), 60);
      }
    });
  }

  ngOnInit() {
    this.productService.getAll(undefined, undefined, 1, 200).subscribe({
      next: res => { this.all.set(res.items); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  openBrandSearch(name: string) {
    this.searchService.open(name);
  }

  clearFilters() {
    this.query.set('');
    this.selectedLetter.set('');
  }

  private setupObserver(): void {
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          this.observer!.unobserve(e.target);
        }
      }),
      { threshold: 0.1 },
    );
    document.querySelectorAll('.brand-row:not(.is-visible)').forEach(el =>
      this.observer!.observe(el),
    );
  }
}
