import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { AdminProductCard } from '../../../components/admin-product-card/admin-product-card';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminProductCard],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss'
})
export class AdminProductsPage implements OnInit {
  private productService = inject(ProductService);

  products         = signal<Product[]>([]);
  loading          = signal(true);
  saving           = signal(false);
  error            = signal('');
  showForm         = signal(false);
  editId           = signal<number | null>(null);
  search           = signal('');
  selectedCategory = signal('');

  form: Partial<Product> = this.emptyForm();

  colorsInput    = signal('');
  colorImagesRaw = signal<Record<string, string>>({});

  parsedColors = computed(() =>
    this.colorsInput().split(',').map(s => s.trim()).filter(Boolean)
  );

  categories = computed(() =>
    [...new Set(this.products().map(p => p.category))].sort()
  );

  filteredProducts = computed(() => {
    const q   = this.search().toLowerCase().trim();
    const cat = this.selectedCategory();
    return this.products().filter(p => {
      const matchCat    = !cat || p.category === cat;
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  });

  readonly PAGE_SIZE = 6;
  currentPage = signal(1);

  pagedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredProducts().slice(start, start + this.PAGE_SIZE);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProducts().length / this.PAGE_SIZE)));

  visiblePages = computed(() => {
    const cur = this.currentPage();
    const end = Math.min(cur + 2, this.totalPages());
    return Array.from({ length: end - cur + 1 }, (_, i) => cur + i);
  });

  showEllipsis = computed(() => this.currentPage() + 2 < this.totalPages());

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.productService.getAll(undefined, undefined, 1, 500).subscribe({
      next: (p) => { this.products.set(p.items); this.currentPage.set(1); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  onSearchChange(val: string) {
    this.search.set(val);
    this.currentPage.set(1);
  }

  onCategoryChange(cat: string) {
    this.selectedCategory.set(cat);
    this.currentPage.set(1);
  }

  openCreate() {
    this.form = this.emptyForm();
    this.colorsInput.set('');
    this.colorImagesRaw.set({});
    this.editId.set(null);
    this.showForm.set(true);
  }

  openEdit(p: Product) {
    this.form = { ...p };
    this.editId.set(p.id);
    this.colorsInput.set(Array.isArray(p.colors) ? p.colors.join(', ') : '');
    const raw: Record<string, string> = {};
    if (p.colorImages) {
      for (const [color, urls] of Object.entries(p.colorImages)) {
        raw[color] = Array.isArray(urls) ? urls.join(', ') : '';
      }
    }
    this.colorImagesRaw.set(raw);
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); this.error.set(''); }

  onColorsChange(value: string) {
    this.colorsInput.set(value);
    const colors = value.split(',').map(s => s.trim()).filter(Boolean);
    const current = { ...this.colorImagesRaw() };
    for (const c of colors) {
      if (!(c in current)) current[c] = '';
    }
    this.colorImagesRaw.set(current);
  }

  setColorImage(color: string, value: string) {
    this.colorImagesRaw.update(r => ({ ...r, [color]: value }));
  }

  getColorImage(color: string): string {
    return this.colorImagesRaw()[color] ?? '';
  }

  submit() {
    this.saving.set(true);
    this.error.set('');

    const colors = this.parsedColors();
    const colorImages: Record<string, string[]> = {};
    for (const color of colors) {
      const urls = (this.colorImagesRaw()[color] ?? '')
        .split(',').map(s => s.trim()).filter(Boolean);
      if (urls.length) colorImages[color] = urls;
    }

    const firstColorImages = colors.length > 0
      ? (colorImages[colors[0]] ?? [])
      : this.asArray(this.form.images);

    const formData: Partial<Product> = {
      ...this.form,
      images:      firstColorImages,
      colors,
      sizes:       this.asArray(this.form.sizes),
      colorImages: Object.keys(colorImages).length ? colorImages : {},
    };

    const obs = this.editId()
      ? this.productService.update(this.editId()!, formData)
      : this.productService.create(formData);

    obs.subscribe({
      next: () => { this.loadProducts(); this.closeForm(); this.saving.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Error al guardar'); this.saving.set(false); }
    });
  }

  delete(id: number) {
    if (!confirm('¿Eliminar este producto?')) return;
    this.productService.delete(id).subscribe(() => this.loadProducts());
  }

  private emptyForm(): Partial<Product> {
    return { name: '', description: '', price: 0, stock: 0, brand: '', category: '', isOffer: false, isFeatured: false, images: [], colors: [], sizes: [], colorImages: {} };
  }

  private asArray(val: unknown): string[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return (val as string).split(',').map(s => s.trim()).filter(Boolean);
    return [];
  }

  asString(val: string[] | string | undefined): string {
    if (Array.isArray(val)) return val.join(', ');
    return val ?? '';
  }
}
