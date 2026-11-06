import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface AdminSection {
  readonly path: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

/** Accesos a las secciones del panel de administración. */
@Component({
  selector: 'app-admin-nav-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './admin-nav-cards.html',
  styleUrl: './admin-nav-cards.scss',
})
export class AdminNavCards {
  protected readonly sections: readonly AdminSection[] = [
    { path: '/admin/products', icon: 'inventory_2', title: 'Productos', description: 'Agregar, editar y eliminar productos del catálogo' },
    { path: '/admin/orders', icon: 'receipt_long', title: 'Pedidos', description: 'Ver todos los pedidos y actualizar su estado' },
    { path: '/admin/users', icon: 'group', title: 'Usuarios', description: 'Ver todos los usuarios registrados en la plataforma' },
    { path: '/admin/coupons', icon: 'local_offer', title: 'Cupones', description: 'Crear y gestionar cupones de descuento' },
    { path: '/admin/deals', icon: 'local_fire_department', title: 'Ofertas del Día', description: 'Configurar el timer y productos del banner de ofertas' },
    { path: '/admin/reclamaciones', icon: 'assignment', title: 'Reclamaciones', description: 'Gestionar reclamos y quejas del libro de reclamaciones' },
  ];
}
