import type { OnInit} from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import type { User } from '../../../core/models/user.model';

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

  readonly PAGE_SIZE = 6;
  currentPage = signal(1);

  pagedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.users().slice(start, start + this.PAGE_SIZE);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.users().length / this.PAGE_SIZE)));

  visiblePages = computed(() => {
    const cur = this.currentPage();
    const end = Math.min(cur + 2, this.totalPages());
    return Array.from({ length: end - cur + 1 }, (_, i) => cur + i);
  });

  showEllipsis = computed(() => this.currentPage() + 2 < this.totalPages());

  ngOnInit() {
    this.userService.getAll().subscribe({
      next:  u => { this.users.set(u); this.currentPage.set(1); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }
}
