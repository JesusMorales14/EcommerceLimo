import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-deals-day',
  standalone: true,
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
