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
  @Input() name: string = '';
  @Input() category: string = '';
  @Input() price: number = 0;
  @Input() oldPrice: number = 0;
  @Input() image: string = '';
}
