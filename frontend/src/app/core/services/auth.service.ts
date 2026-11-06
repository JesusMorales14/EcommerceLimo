import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import type { AuthResponse, User } from '../models/user.model';
import { ApiService } from './api.service';
import { SessionStorageService } from './session-storage.service';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export type ProfileUpdate = Partial<Pick<User, 'name' | 'phone' | 'address'>>;

/** Autenticación y estado de la sesión del usuario (signals). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly storage = inject(SessionStorageService);

  private readonly _user = signal<User | null>(this.storage.readUser());
  private readonly _token = signal<string | null>(this.storage.readToken());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null && this._token() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');

  /** Revalida la sesión guardada contra el backend al iniciar la app. */
  initSession(): void {
    if (!this._token()) return;
    this.api.get<User>('/auth/me').subscribe({
      next: (user) => this.updateLocalUser(user),
      error: () => this.logout(),
    });
  }

  login(email: string, password: string) {
    return this.api.post<AuthResponse>('/auth/login', { email, password }).pipe(tap((res) => this.saveSession(res)));
  }

  register(data: RegisterInput) {
    return this.api.post<AuthResponse>('/auth/register', data).pipe(tap((res) => this.saveSession(res)));
  }

  updateProfile(data: ProfileUpdate) {
    return this.api.patch<User>('/auth/profile', data).pipe(tap((user) => this.updateLocalUser(user)));
  }

  logout(): void {
    this._user.set(null);
    this._token.set(null);
    this.storage.clear();
    void this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this._token();
  }

  updateLocalUser(data: Partial<User>): void {
    const current = this._user();
    if (!current) return;
    const updated = { ...current, ...data };
    this._user.set(updated);
    this.storage.saveUser(updated);
  }

  private saveSession({ token, user }: AuthResponse): void {
    this._token.set(token);
    this._user.set(user);
    this.storage.save(token, user);
  }
}
