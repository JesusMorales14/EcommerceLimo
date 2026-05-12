import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsersPage implements OnInit {
  private userService = inject(UserService);

  users   = signal<User[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.userService.getAll().subscribe({
      next:  u => { this.users.set(u); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
