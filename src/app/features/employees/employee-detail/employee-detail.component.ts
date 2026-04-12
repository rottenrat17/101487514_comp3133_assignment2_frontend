import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeGraphqlService } from '../services/employee-graphql.service';
import { Employee } from '../models/employee.model';
import { SalaryDisplayPipe } from '../../../shared/pipes/salary-display.pipe';
import { HoverElevateDirective } from '../../../shared/directives/hover-elevate.directive';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatProgressSpinnerModule,
    SalaryDisplayPipe,
    HoverElevateDirective,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss',
})
export class EmployeeDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(EmployeeGraphqlService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly employee = signal<Employee | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Missing employee id');
      this.loading.set(false);
      return;
    }
    this.api.getById(id).subscribe({
      next: (emp) => {
        if (!emp) this.error.set('Employee not found');
        else this.employee.set(emp);
        this.loading.set(false);
      },
      error: (e: Error) => {
        this.error.set(e.message);
        this.loading.set(false);
      },
    });
  }

  joinedDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  }
}
