import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-deals-day',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './deals-day.html',
  styleUrl: './deals-day.scss',
})
export class DealsDay {
  @Input() name = '';
  @Input() category = '';
  @Input() price = 0;
  @Input() oldPrice = 0;
  @Input() image = '';
}
