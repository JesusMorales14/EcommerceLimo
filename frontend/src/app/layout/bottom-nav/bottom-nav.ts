import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '@core/services/cart.service';
import { FavoritesService } from '@core/services/favorites.service';

/** Barra de navegación inferior para móviles. */
@Component({
  selector: 'app-bottom-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.scss',
})
export class BottomNav {
  cartService = inject(CartService);
  favService  = inject(FavoritesService);

  openCart() { this.cartService.openCart(); }
}
