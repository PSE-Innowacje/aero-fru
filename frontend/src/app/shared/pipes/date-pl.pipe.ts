import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datePl',
  standalone: true
})
export class DatePlPipe implements PipeTransform {
  transform(value: string | null | undefined, format: 'date' | 'datetime' = 'date'): string {
    if (!value) return '—';

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;

      if (format === 'datetime') {
        return new Intl.DateTimeFormat('pl-PL', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      }

      return new Intl.DateTimeFormat('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch {
      return value || '—';
    }
  }
}
