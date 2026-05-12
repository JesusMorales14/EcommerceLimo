import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthResponse, User } from '../models/user.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api    = inject(ApiService);
  private router = inject(Router);

  private _user  = signal<User | null>(this.restoreUser());
  private _token = signal<string | null>(localStorage.getItem('gh_token'));

  isLoggedIn = computed(() => this._user() !== null);
  isAdmin    = computed(() => this._user()?.role === 'ADMIN');
  user       = this._user.asReadonly();

  initSession() {
    if (!this._token()) return;
    this.api.get<User>('/auth/me').subscribe({
      next: user => this.updateLocalUser(user),
      error: () => this.logout(),
    });
  }

  login(email: string, password: string) {
    return this.api.post<AuthResponse>('/auth/login', { email, password })
      .pipe(tap(res => this.saveSession(res)));
  }

  register(data: { name: string; email: string; password: string; phone?: string }) {
    return this.api.post<AuthResponse>('/auth/register', data)
      .pipe(tap(res => this.saveSession(res)));
  }

  updateProfile(data: { name?: string; phone?: string; address?: string }) {
    return this.api.patch<User>('/auth/profile', data)
      .pipe(tap(user => this.updateLocalUser(user)));
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem('gh_token');
    localStorage.removeItem('gh_user');
    this.router.navigate(['/']);
  }

  getToken() { return this._token(); }

  updateLocalUser(data: Partial<User>) {
    const updated = { ...this._user()!, ...data };
    this._user.set(updated);
    localStorage.setItem('gh_user', JSON.stringify(updated));
  }

  private saveSession(res: AuthResponse) {
    this._token.set(res.token);
    this._user.set(res.user);
    localStorage.setItem('gh_token', res.token);
    localStorage.setItem('gh_user', JSON.stringify(res.user));
  }

  private restoreUser(): User | null {
    try {
      const raw = localStorage.getItem('gh_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
