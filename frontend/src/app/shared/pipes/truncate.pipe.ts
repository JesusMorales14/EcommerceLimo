import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true, pure: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 60, suffix = '...'): string {
    if (!value) return '';
    return value.length > limit ? value.slice(0, limit).trimEnd() + suffix : value;
  }
}
