import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { BottomNav } from './components/bottom-nav/bottom-nav';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart';
import { CategoryService } from './core/services/category.service';
import { FavoritesService } from './core/services/favorites.service';
import { ChatSupport } from './components/chat-support/chat-support';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Header, Footer, BottomNav, CommonModule, ChatSupport],
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
