import { Injectable } from '@angular/core';
import type { User } from '../models/user.model';

const TOKEN_KEY = 'gh_token';
const USER_KEY = 'gh_user';

/**
 * Persistencia de la sesión en el navegador (Repository de la sesión).
 * Aísla el acceso a `localStorage` y tolera navegadores sin almacenamiento.
 */
@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  readToken(): string | null {
    return this.safe(() => localStorage.getItem(TOKEN_KEY));
  }

  readUser(): User | null {
    return this.safe(() => {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    });
  }

  save(token: string, user: User): void {
    this.safe(() => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    });
  }

  saveUser(user: User): void {
    this.safe(() => localStorage.setItem(USER_KEY, JSON.stringify(user)));
  }

  clear(): void {
    this.safe(() => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    });
  }

  private safe<T>(operation: () => T): T | null {
    try {
      return operation();
    } catch {
      return null;
    }
  }
}
