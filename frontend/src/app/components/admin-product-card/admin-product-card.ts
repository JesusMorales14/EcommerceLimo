import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Product } from '../../core/models/product.model';
import { CurrencyPenPipe } from '../../shared/pipes';

@Component({
  selector: 'app-admin-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPenPipe],
  templateUrl: './admin-product-card.html',
  styleUrl: './admin-product-card.scss'
})
export class AdminProductCard {
  @Input() product!: Product;
  @Output() edit   = new EventEmitter<Product>();
  @Output() remove = new EventEmitter<number>();
}
