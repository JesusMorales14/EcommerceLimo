import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import type { FormControl, FormGroup } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

const NAME_MAX_LENGTH = 80;

type ProfileForm = FormGroup<{
  name: FormControl<string>;
  phone: FormControl<string>;
  address: FormControl<string>;
}>;

/** Formulario reactivo para editar los datos del perfil. */
@Component({
  selector: 'app-profile-edit-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './profile-edit-form.html',
  styleUrl: './profile-edit-form.scss',
})
export class ProfileEditForm {
  private readonly auth = inject(AuthService);
  readonly closed = output<void>();

  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly form: ProfileForm = inject(FormBuilder).nonNullable.group({
    name: [this.auth.user()?.name ?? '', [Validators.required, Validators.maxLength(NAME_MAX_LENGTH)]],
    phone: [this.auth.user()?.phone ?? ''],
    address: [this.auth.user()?.address ?? ''],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, phone, address } = this.form.getRawValue();
    this.saving.set(true);
    this.error.set('');
    this.auth
      .updateProfile({ name: name.trim(), phone: phone.trim() || undefined, address: address.trim() || undefined })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.closed.emit();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo guardar el perfil. Intenta nuevamente.');
        },
      });
  }
}
