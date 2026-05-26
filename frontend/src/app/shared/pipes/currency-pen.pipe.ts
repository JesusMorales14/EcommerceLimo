import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyPen', standalone: true, pure: true })
export class CurrencyPenPipe implements PipeTransform {
  private fmt = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  transform(value: number | null | undefined): string {
    if (value == null) return 'S/ 0';
    return this.fmt.format(value);
  }
}
