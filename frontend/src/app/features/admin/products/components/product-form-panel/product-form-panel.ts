import type { HttpErrorResponse } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Product } from '@core/models/product.model';
import { ProductService } from '@core/services/product.service';
import { extractErrorMessage } from '@shared/utils/http-error';
import { emptyProductForm, toProductFormValue, toProductPayload } from '../../data/product-form';
import { ColorImagesEditor } from '../color-images-editor/color-images-editor';

const MAX_DISCOUNT = 100;

/** Panel lateral con el formulario de alta/edición de productos. */
@Component({
  selector: 'app-product-form-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ColorImagesEditor],
  templateUrl: './product-form-panel.html',
  styleUrl: './product-form-panel.scss',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class ProductFormPanel implements OnInit {
  /** Producto a editar; `null` para crear uno nuevo. */
  readonly product = input<Product | null>(null);
  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly products = inject(ProductService);
  private readonly initial = computed(() => {
    const product = this.product();
    return product ? toProductFormValue(product) : emptyProductForm();
  });

  protected readonly isEdit = computed(() => this.product() !== null);
  protected readonly saving = signal(false);
  protected readonly error = signal('');

  private readonly fb = inject(FormBuilder);
  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    discount: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(MAX_DISCOUNT)]),
    stock: [0, [Validators.required, Validators.min(0)]],
    brand: [''],
    category: ['', Validators.required],
    subCategory: [''],
    sizes: [''],
    isOffer: [false],
    isFeatured: [false],
  });

  protected readonly colors = signal('');
  protected readonly images = signal('');
  protected readonly colorImages = signal<Record<string, string>>({});

  ngOnInit(): void {
    const { colors, images, colorImages, ...rest } = this.initial();
    this.form.reset(rest);
    this.colors.set(colors);
    this.images.set(images);
    this.colorImages.set(colorImages);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Completa los campos obligatorios.');
      return;
    }
    const payload = toProductPayload({
      ...this.form.getRawValue(),
      colors: this.colors(),
      images: this.images(),
      colorImages: this.colorImages(),
    });
    const product = this.product();
    const request = product ? this.products.update(product.id, payload) : this.products.create(payload);

    this.saving.set(true);
    this.error.set('');
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.emit();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractErrorMessage(err, 'Error al guardar'));
        this.saving.set(false);
      },
    });
  }
}
