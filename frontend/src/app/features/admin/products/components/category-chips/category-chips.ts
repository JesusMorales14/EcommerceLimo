import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/** Filtro por categoría en forma de chips ('' = todas). */
@Component({
  selector: 'app-category-chips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-chips.html',
  styleUrl: './category-chips.scss',
})
export class CategoryChips {
  readonly categories = input.required<readonly string[]>();
  readonly selected = model('');
}
