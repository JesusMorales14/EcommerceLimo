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

  // Signal para las URLs raw por color (objeto clave→string csv)
  colorImagesRaw = signal<Record<string, string>>({});

  // Colores actuales parseados desde el input de colores
  parsedColors = computed(() => {
    const raw = this.form.colors;
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === 'string') return (raw as string).split(',').map(s => s.trim()).filter(Boolean);
    return [];
  });

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
    this.colorImagesRaw.set({});
    this.editId.set(null);
    this.showForm.set(true);
  }

  openEdit(p: Product) {
    this.form = { ...p };
    this.editId.set(p.id);
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

  // Llamado cuando el usuario cambia el input de colores
  onColorsChange(value: string) {
    this.form.colors = value as unknown as string[];
    // Mantener las entradas existentes y agregar nuevas vacías
    const newColors = value.split(',').map(s => s.trim()).filter(Boolean);
    const current = { ...this.colorImagesRaw() };
    // No eliminar datos existentes aunque el color ya no esté listado
    for (const c of newColors) {
      if (!(c in current)) current[c] = '';
    }
    this.colorImagesRaw.set(current);
  }

  // Llamado cuando el usuario escribe en el input de imagen de un color
  setColorImage(color: string, value: string) {
    this.colorImagesRaw.update(r => ({ ...r, [color]: value }));
  }

  getColorImage(color: string): string {
    return this.colorImagesRaw()[color] ?? '';
  }

  submit() {
    this.saving.set(true);
    this.error.set('');
    const colorImages: Record<string, string[]> = {};
    for (const [color, raw] of Object.entries(this.colorImagesRaw())) {
      const urls = raw.split(',').map(s => s.trim()).filter(Boolean);
      if (urls.length) colorImages[color] = urls;
    }
    const formData: Partial<Product> = {
      ...this.form,
      images:      this.asArray(this.form.images),
      colors:      this.asArray(this.form.colors),
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
    return { name: '', description: '', price: 0, stock: 0, brand: '', category: '', isOffer: false, images: [], colors: [], sizes: [], colorImages: {} };
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
