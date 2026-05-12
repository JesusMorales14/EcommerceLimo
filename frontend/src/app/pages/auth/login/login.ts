import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginPage {
  private auth      = inject(AuthService);
  private router    = inject(Router);
  private favorites = inject(FavoritesService);

  email    = '';
  password = '';
  loading  = signal(false);
  error    = signal('');

  submit() {
    if (!this.email || !this.password) { this.error.set('Completa todos los campos'); return; }
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.favorites.loadFavorites();
        const redirect = history.state?.redirect || '/';
        this.router.navigateByUrl(redirect);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Credenciales incorrectas');
        this.loading.set(false);
      }
    });
  }
}
