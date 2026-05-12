import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterPage {
  private auth      = inject(AuthService);
  private router    = inject(Router);
  private favorites = inject(FavoritesService);

  name     = '';
  email    = '';
  phone    = '';
  password = '';
  loading  = signal(false);
  error    = signal('');

  submit() {
    if (!this.name || !this.email || !this.password) {
      this.error.set('Nombre, correo y contraseña son obligatorios');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.register({ name: this.name, email: this.email, password: this.password, phone: this.phone || undefined }).subscribe({
      next: () => {
        this.favorites.loadFavorites();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al crear cuenta');
        this.loading.set(false);
      }
    });
  }
}
