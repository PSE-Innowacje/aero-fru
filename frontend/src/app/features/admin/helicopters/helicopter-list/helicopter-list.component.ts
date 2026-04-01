import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { HelicopterService } from '../helicopter.service';
import { HelicopterListItem } from '../../../../core/models/helicopter.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { ROLES } from '../../../../core/constants';

@Component({
  selector: 'app-helicopter-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, StatusBadgeComponent],
  templateUrl: './helicopter-list.component.html',
  styleUrl: './helicopter-list.component.scss'
})
export class HelicopterListComponent implements OnInit {
  private helicopterService = inject(HelicopterService);
  private authService = inject(AuthService);
  router = inject(Router);

  helicopters = signal<HelicopterListItem[]>([]);
  loading = signal(true);
  displayedColumns = ['registrationNumber', 'helicopterType', 'status'];

  ngOnInit(): void {
    this.loadData();
  }

  isAdmin(): boolean {
    return this.authService.hasRole(ROLES.ADMIN);
  }

  loadData(): void {
    this.helicopterService.getAll().subscribe({
      next: data => {
        this.helicopters.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSort(sort: Sort): void {
    const data = [...this.helicopters()];
    if (!sort.active || sort.direction === '') {
      this.helicopters.set(data);
      return;
    }
    data.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sort.active] as string;
      const bVal = (b as unknown as Record<string, unknown>)[sort.active] as string;
      return (sort.direction === 'asc' ? 1 : -1) * aVal.localeCompare(bVal);
    });
    this.helicopters.set(data);
  }

  onRowClick(row: HelicopterListItem): void {
    this.router.navigate(['/admin/helicopters', row.id]);
  }
}
