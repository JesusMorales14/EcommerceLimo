import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../core/services/favorites.service';
import { CartService } from '../../core/services/cart';
import { CurrencyPenPipe } from '../../shared/pipes';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPenPipe],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss'
})
export class FavoritesPage {
  favService  = inject(FavoritesService);
  cartService = inject(CartService);
}
