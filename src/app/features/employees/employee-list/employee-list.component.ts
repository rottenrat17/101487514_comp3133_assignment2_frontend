import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmployeeGraphqlService } from '../services/employee-graphql.service';
import { Employee } from '../models/employee.model';
import { HoverElevateDirective } from '../../../shared/directives/hover-elevate.directive';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    HoverElevateDirective,
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private readonly api = inject(EmployeeGraphqlService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly employees = signal<Employee[]>([]);

  readonly displayedColumns = ['first_name', 'last_name', 'email', 'department', 'designation', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getAll().subscribe({
      next: (rows) => {
        this.employees.set(rows);
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.error.set(e.message || 'Could not load employees');
        this.loading.set(false);
      },
    });
  }

  delete(emp: Employee): void {
    const ref = this.dialog.open(ConfirmDeleteDialogComponent, {
      data: { name: `${emp.first_name} ${emp.last_name}` },
      width: '360px',
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.api.delete(emp._id).subscribe({
        next: (res) => {
          this.snack.open(res.message, 'Dismiss', { duration: 4000 });
          if (res.success) this.load();
        },
        error: (e: Error) => this.snack.open(e.message, 'Dismiss', { duration: 5000 }),
      });
    });
  }
}
