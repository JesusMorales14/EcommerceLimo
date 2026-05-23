import { inject, Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { ApiService } from './api.service';

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiService);

  getAll(category?: string, subCategory?: string, page = 1, limit = 40) {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (category)    params['category']    = category;
    if (subCategory) params['subCategory'] = subCategory;
    return this.api.get<ProductPage>('/products', params);
  }

  search(query: string, page = 1, limit = 40) {
    return this.api.get<ProductPage>('/products', {
      search: query,
      page: String(page),
      limit: String(limit),
    });
  }

  getOffers() {
    return this.api.get<ProductPage>('/products', { isOffer: 'true', limit: '100' });
  }

  getFeatured(limit = 8) {
    return this.api.get<ProductPage>('/products', { isFeatured: 'true', limit: String(limit) });
  }

  getById(id: number) {
    return this.api.get<Product>(`/products/${id}`);
  }

  create(data: Partial<Product>) {
    return this.api.post<Product>('/products', data);
  }

  update(id: number, data: Partial<Product>) {
    return this.api.patch<Product>(`/products/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete<void>(`/products/${id}`);
  }

  getStats() {
    return this.api.get<{
      totalProducts: number;
      lowStock: number;
      totalOrders: number;
      totalRevenue: number;
      recentOrders: any[];
    }>('/products/stats');
  }
}
