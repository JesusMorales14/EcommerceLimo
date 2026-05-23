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

  // Signal para el string de colores del input (reactivo)
  colorsInput     = signal('');
  // Signal para las URLs de imagen por color
  colorImagesRaw  = signal<Record<string, string>>({});

  // Colores parseados desde el signal — se actualiza automáticamente al escribir
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

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.productService.getAll(undefined, undefined, 1, 500).subscribe({
      next: (p) => { this.products.set(p.items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
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

    // Cargar colores como string para el input
    this.colorsInput.set(Array.isArray(p.colors) ? p.colors.join(', ') : '');

    // Cargar imágenes por color
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

  // Al cambiar el input de colores: actualiza el signal y agrega entradas vacías para colores nuevos
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

    // Construir colorImages solo para colores que tienen URLs
    const colorImages: Record<string, string[]> = {};
    for (const color of colors) {
      const urls = (this.colorImagesRaw()[color] ?? '')
        .split(',').map(s => s.trim()).filter(Boolean);
      if (urls.length) colorImages[color] = urls;
    }

    // Las imágenes principales del producto = imágenes del primer color
    // Si no hay colores, usar el campo genérico de imágenes
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
