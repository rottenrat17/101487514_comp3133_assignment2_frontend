import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeGraphqlService } from '../services/employee-graphql.service';
import { Employee } from '../models/employee.model';
import { HoverElevateDirective } from '../../../shared/directives/hover-elevate.directive';

@Component({
  selector: 'app-employee-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    HoverElevateDirective,
  ],
  templateUrl: './employee-search.component.html',
  styleUrl: './employee-search.component.scss',
})
export class EmployeeSearchComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(EmployeeGraphqlService);

  readonly loading = signal(false);
  readonly hint = signal<string | null>(
    'Add a job title and/or department, then click Search.'
  );
  readonly results = signal<Employee[]>([]);
  readonly searched = signal(false);

  readonly form = this.fb.nonNullable.group({
    designation: [''],
    department: [''],
  });

  runSearch(): void {
    const { designation, department } = this.form.getRawValue();
    const d = designation.trim();
    const p = department.trim();
    if (!d && !p) {
      this.hint.set('Enter a job title or a department (or both).');
      this.results.set([]);
      this.searched.set(false);
      return;
    }
    this.hint.set(null);
    this.loading.set(true);
    this.searched.set(true);
    this.api.search(d || null, p || null).subscribe({
      next: (rows) => {
        this.results.set(rows);
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.hint.set(e.message);
        this.loading.set(false);
      },
    });
  }

  clear(): void {
    this.form.reset({ designation: '', department: '' });
    this.results.set([]);
    this.searched.set(false);
    this.hint.set('Filters cleared. Try a new search when you are ready.');
  }
}
