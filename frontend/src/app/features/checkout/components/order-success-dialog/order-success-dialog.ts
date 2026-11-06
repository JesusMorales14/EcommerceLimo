import type { ElementRef } from '@angular/core';
import { afterNextRender, ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Diálogo modal que confirma una compra exitosa. */
@Component({
  selector: 'app-order-success-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './order-success-dialog.html',
  styleUrl: './order-success-dialog.scss',
})
export class OrderSuccessDialog {
  private readonly primaryAction = viewChild<ElementRef<HTMLElement>>('primaryAction');

  constructor() {
    afterNextRender(() => this.primaryAction()?.nativeElement.focus());
  }
}
