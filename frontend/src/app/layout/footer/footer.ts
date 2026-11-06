import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FOOTER_LINK_GROUPS, SOCIAL_LINKS } from '@core/config/navigation.config';
import { SITE_CONFIG } from '@core/config/site.config';
import { SocialIcon } from '@shared/components/social-icon/social-icon';

const SOCIAL_LINKS_PER_ROW = 2;

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UpperCasePipe, SocialIcon],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly storeName = SITE_CONFIG.storeName;
  protected readonly currentYear = new Date().getFullYear();
  protected readonly linkGroups = FOOTER_LINK_GROUPS;
  protected readonly socialRows = Array.from(
    { length: Math.ceil(SOCIAL_LINKS.length / SOCIAL_LINKS_PER_ROW) },
    (_, i) => SOCIAL_LINKS.slice(i * SOCIAL_LINKS_PER_ROW, (i + 1) * SOCIAL_LINKS_PER_ROW),
  );
}
