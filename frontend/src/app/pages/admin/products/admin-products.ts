import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
  colorImagesRaw: Record<string, string> = {};

  categories = computed(() =>
    [...new Set(this.products().map(p => p.category))].sort()
  );

  filteredProducts = computed(() => {
    const q   = this.search().toLowerCase().trim();
    const cat = this.selectedCategory();
    return this.products().filter(p => {
      const matchCat    = !cat || p.category === cat;
      const matchSearch = !q  || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  });

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.productService.getAll(undefined, undefined, 1, 500).subscribe({
      next: (p) => { this.products.set(p.items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() {
    this.form = this.emptyForm();
    this.colorImagesRaw = {};
    this.editId.set(null);
    this.showForm.set(true);
  }

  openEdit(p: Product) {
    this.form = { ...p };
    this.editId.set(p.id);
    this.colorImagesRaw = {};
    if (p.colorImages) {
      for (const [color, urls] of Object.entries(p.colorImages)) {
        this.colorImagesRaw[color] = urls.join(', ');
      }
    }
    this.showForm.set(true);
  }

  get parsedColors(): string[] {
    return this.asArray(this.form.colors).filter(Boolean);
  }

  closeForm() { this.showForm.set(false); this.error.set(''); }

  submit() {
    this.saving.set(true);
    this.error.set('');
    const colorImages: Record<string, string[]> = {};
    for (const [color, raw] of Object.entries(this.colorImagesRaw)) {
      const urls = raw.split(',').map(s => s.trim()).filter(Boolean);
      if (urls.length) colorImages[color] = urls;
    }
    const formData: Partial<Product> = {
      ...this.form,
      images:      this.asArray(this.form.images),
      colors:      this.asArray(this.form.colors),
      sizes:       this.asArray(this.form.sizes),
      colorImages: Object.keys(colorImages).length ? colorImages : undefined,
    };
    const obs = this.editId()
      ? this.productService.update(this.editId()!, formData)
      : this.productService.create(formData);

    obs.subscribe({
      next: () => { this.loadProducts(); this.closeForm(); this.saving.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Error'); this.saving.set(false); }
    });
  }

  delete(id: number) {
    if (!confirm('¿Eliminar este producto?')) return;
    this.productService.delete(id).subscribe(() => this.loadProducts());
  }

  private emptyForm(): Partial<Product> {
    return { name: '', description: '', price: 0, stock: 0, brand: '', category: '', isOffer: false, images: [], colors: [], sizes: [], colorImages: {} };
  }

  private asArray(val: unknown): string[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  }

  asString(val: string[] | undefined): string {
    return Array.isArray(val) ? val.join(', ') : (val ?? '');
  }
}
