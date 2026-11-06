import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/** Botón "Mi Cuenta" con su menú desplegable (perfil, admin, sesión). */
@Component({
  selector: 'app-account-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './account-menu.html',
  styleUrl: './account-menu.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class AccountMenu {
  protected readonly auth = inject(AuthService);
  protected readonly isOpen = signal(false);
  protected readonly firstName = computed(() => this.auth.user()?.name?.split(' ')[0] ?? '');

  protected toggle(): void {
    this.isOpen.update((open) => !open);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected logout(): void {
    this.auth.logout();
    this.close();
  }
}
