import type { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { safeRedirect } from '@core/utils/safe-redirect';
import { extractErrorMessage } from '@shared/utils/http-error';
import { AuthCard } from '../../components/auth-card/auth-card';

/** Pantalla de inicio de sesión. */
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthCard],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Completa todos los campos');
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set('');
    this.auth.login(email.trim(), password).subscribe({
      next: () => void this.router.navigateByUrl(safeRedirect(history.state?.redirect)),
      error: (err: HttpErrorResponse) => {
        this.error.set(extractErrorMessage(err, 'Credenciales incorrectas'));
        this.loading.set(false);
      },
    });
  }
}
