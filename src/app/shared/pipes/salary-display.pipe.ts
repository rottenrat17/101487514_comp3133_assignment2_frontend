import { Pipe, PipeTransform } from '@angular/core';

// Salary in Canadian dollars (tables and detail views).
@Pipe({
  name: 'salaryDisplay',
  standalone: true,
})
export class SalaryDisplayPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) {
      return '—';
    }
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value);
  }
}
