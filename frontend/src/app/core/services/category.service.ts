import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface SubCategory { id: string; label: string; }
export interface Category { id: string; label: string; icon: string; desc: string; subCategories: SubCategory[]; }

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private api = inject(ApiService);

  private _categories = signal<Category[]>([]);
  categories = this._categories.asReadonly();

  load() {
    this.api.get<Category[]>('/categories').subscribe(cats => this._categories.set(cats));
  }

  findById(id: string): Category | undefined {
    return this._categories().find(c => c.id === id);
  }
}
