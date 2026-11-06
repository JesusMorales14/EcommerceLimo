import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { OrderService } from '@core/services/order.service';
import { Pagination } from '@shared/components/pagination/pagination';
import { createClientPagination } from '@shared/utils/pagination';
import { OrderCard } from '../../components/order-card/order-card';
import { ProfileEditForm } from '../../components/profile-edit-form/profile-edit-form';
import { ProfileHeader } from '../../components/profile-header/profile-header';

const ORDERS_PER_PAGE = 3;

/** Página "Mi cuenta": perfil y pedidos del cliente. */
@Component({
  selector: 'app-account',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProfileHeader, ProfileEditForm, OrderCard, Pagination],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class AccountPage {
  private readonly orderService = inject(OrderService);

  protected readonly editMode = signal(false);
  protected readonly orderSuccess = signal(history.state?.orderSuccess === true);

  protected readonly ordersResource = rxResource({ stream: () => this.orderService.getMyOrders() });
  protected readonly orders = computed(() => (this.ordersResource.hasValue() ? this.ordersResource.value() : []));
  protected readonly pager = createClientPagination(this.orders, ORDERS_PER_PAGE);
}
