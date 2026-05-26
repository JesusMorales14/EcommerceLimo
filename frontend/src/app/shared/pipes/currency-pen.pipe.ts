import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyPen', standalone: true, pure: true })
export class CurrencyPenPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals = 0): string {
    if (value == null) return 'S/ 0';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}
