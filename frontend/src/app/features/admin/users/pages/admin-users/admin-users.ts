import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { Pagination } from '@shared/components/pagination/pagination';
import { createClientPagination } from '@shared/utils/pagination';
import { UsersTable } from '../../components/users-table/users-table';

const PAGE_SIZE = 6;

/** Listado de usuarios registrados. */
@Component({
  selector: 'app-admin-users',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, UsersTable, Pagination],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsersPage {
  private readonly userService = inject(UserService);

  protected readonly usersResource = rxResource({ stream: () => this.userService.getAll() });
  protected readonly users = computed(() => (this.usersResource.hasValue() ? this.usersResource.value() : []));
  protected readonly pager = createClientPagination(this.users, PAGE_SIZE);
}
