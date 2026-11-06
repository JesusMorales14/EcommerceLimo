import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '@core/services/favorites.service';
import { ProductCard } from '@shared/components/product-card/product-card';

/** Página de productos favoritos del cliente. */
@Component({
  selector: 'app-favorites',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCard],
  templateUrl: './favorites.html',
  styleUrl: './favorites.scss',
})
export class FavoritesPage {
  protected readonly favorites = inject(FavoritesService);
}
