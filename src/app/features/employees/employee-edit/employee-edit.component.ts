import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeGraphqlService } from '../services/employee-graphql.service';
import { HoverElevateDirective } from '../../../shared/directives/hover-elevate.directive';

function toInputDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    HoverElevateDirective,
  ],
  templateUrl: './employee-edit.component.html',
  styleUrl: './employee-edit.component.scss',
})
export class EmployeeEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(EmployeeGraphqlService);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly fileName = signal<string | null>(null);
  employeeId = '';
  private selectedFile: File | null = null;

  readonly form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    gender: ['Male' as 'Male' | 'Female' | 'Other', [Validators.required]],
    designation: ['', [Validators.required]],
    salary: [0, [Validators.required, Validators.min(1000)]],
    date_of_joining: ['', [Validators.required]],
    department: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loadError.set('Missing id');
      this.loading.set(false);
      return;
    }
    this.employeeId = id;
    this.api.getById(id).subscribe({
      next: (emp) => {
        if (!emp) {
          this.loadError.set('Employee not found');
          this.loading.set(false);
          return;
        }
        this.form.patchValue({
          first_name: emp.first_name,
          last_name: emp.last_name,
          email: emp.email,
          gender: emp.gender as 'Male' | 'Female' | 'Other',
          designation: emp.designation,
          salary: emp.salary,
          date_of_joining: toInputDate(emp.date_of_joining),
          department: emp.department,
        });
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.loadError.set(e.message);
        this.loading.set(false);
      },
    });
  }

  onFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.fileName.set(file.name);
    } else {
      this.selectedFile = null;
      this.fileName.set(null);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.api
      .update(this.employeeId, {
        ...v,
        salary: Number(v.salary),
        employee_photo: this.selectedFile,
      })
      .subscribe({
        next: () => {
          this.snack.open('Employee updated', 'OK', { duration: 3000 });
          void this.router.navigate(['/employees', this.employeeId]);
        },
        error: (e: Error) => {
          this.snack.open(e.message || 'Update failed', 'Dismiss', { duration: 6000 });
          this.saving.set(false);
        },
        complete: () => this.saving.set(false),
      });
  }
}
