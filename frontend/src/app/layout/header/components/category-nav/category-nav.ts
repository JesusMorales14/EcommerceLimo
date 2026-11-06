import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CategoryService } from '@core/services/category.service';

/** Barra horizontal de categorías (escritorio). */
@Component({
  selector: 'app-category-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './category-nav.html',
  styleUrl: './category-nav.scss',
})
export class CategoryNav {
  protected readonly categories = inject(CategoryService).categories;
}
