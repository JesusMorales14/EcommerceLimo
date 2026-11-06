import type { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { safeRedirect } from '@core/utils/safe-redirect';
import { extractErrorMessage } from '@shared/utils/http-error';
import { AuthCard } from '../../components/auth-card/auth-card';

export const MIN_PASSWORD_LENGTH = 6;

/** Pantalla de registro de nuevos clientes. */
@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthCard],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Nombre, correo y contraseña son obligatorios');
      return;
    }
    const { name, email, phone, password } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set('');
    this.auth.register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() || undefined }).subscribe({
      next: () => void this.router.navigateByUrl(safeRedirect(history.state?.redirect)),
      error: (err: HttpErrorResponse) => {
        this.error.set(extractErrorMessage(err, 'Error al crear cuenta'));
        this.loading.set(false);
      },
    });
  }

  protected showError(control: keyof typeof this.form.controls): boolean {
    const field = this.form.controls[control];
    return field.touched && field.invalid;
  }
}
