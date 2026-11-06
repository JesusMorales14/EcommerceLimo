import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FOOTER_LINK_GROUPS, SOCIAL_LINKS } from '@core/config/navigation.config';
import { CategoryService } from '@core/services/category.service';
import { SocialIcon } from '@shared/components/social-icon/social-icon';

/** Menú lateral (drawer) de categorías para dispositivos móviles. */
@Component({
  selector: 'app-mobile-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, SocialIcon],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class MobileMenu {
  /** Activa la animación de salida antes de desmontar el componente. */
  readonly closing = input(false);
  readonly closed = output<void>();

  protected readonly categories = inject(CategoryService).categories;
  protected readonly linkGroups = FOOTER_LINK_GROUPS;
  protected readonly socialLinks = SOCIAL_LINKS;
}
