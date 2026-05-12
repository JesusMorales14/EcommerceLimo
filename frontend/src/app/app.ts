import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart';
import { CategoryService } from './core/services/category.service';
import { FavoritesService } from './core/services/favorites.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Header, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  cartService = inject(CartService);
  private authService    = inject(AuthService);
  private favService     = inject(FavoritesService);
  private categoryService = inject(CategoryService);

  ngOnInit() {
    this.authService.initSession();
    this.favService.loadFavorites();
    this.categoryService.load();
  }
}
