import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);

  getAll() {
    return this.api.get<User[]>('/users');
  }

  getOne(id: number) {
    return this.api.get<User>(`/users/${id}`);
  }
}
