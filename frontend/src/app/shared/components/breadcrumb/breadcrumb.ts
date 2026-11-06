import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  readonly label: string;
  /** Ruta del enlace. El último elemento (página actual) no lleva enlace. */
  readonly link?: string | readonly unknown[];
}

/** Migas de pan accesibles. El estilo lo aporta la clase que aplique el padre. */
@Component({
  selector: 'app-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
})
export class Breadcrumb {
  readonly items = input.required<readonly BreadcrumbItem[]>();
}
