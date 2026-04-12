import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeGraphqlService } from '../services/employee-graphql.service';
import { HoverElevateDirective } from '../../../shared/directives/hover-elevate.directive';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    HoverElevateDirective,
  ],
  templateUrl: './employee-add.component.html',
  styleUrl: './employee-add.component.scss',
})
export class EmployeeAddComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(EmployeeGraphqlService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly fileName = signal<string | null>(null);
  private selectedFile: File | null = null;

  readonly form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.minLength(1)]],
    last_name: ['', [Validators.required, Validators.minLength(1)]],
    email: ['', [Validators.required, Validators.email]],
    gender: ['Male' as 'Male' | 'Female' | 'Other', [Validators.required]],
    designation: ['', [Validators.required]],
    salary: [0, [Validators.required, Validators.min(1000)]],
    date_of_joining: ['', [Validators.required]],
    department: ['', [Validators.required]],
  });

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
      .add({
        ...v,
        salary: Number(v.salary),
        employee_photo: this.selectedFile,
      })
      .subscribe({
        next: () => {
          this.snack.open('Employee added', 'OK', { duration: 3000 });
          void this.router.navigate(['/employees']);
        },
        error: (e: Error) => {
          this.snack.open(e.message || 'Save failed', 'Dismiss', { duration: 6000 });
          this.saving.set(false);
        },
        complete: () => this.saving.set(false),
      });
  }
}
