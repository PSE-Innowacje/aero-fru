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
  template: `
    <div class="page-header">
      <h2>Helikoptery</h2>
      @if (isAdmin()) {
        <button mat-raised-button color="primary" (click)="router.navigate(['/admin/helicopters/new'])">
          <mat-icon>add</mat-icon> Dodaj helikopter
        </button>
      }
    </div>

    <mat-card>
      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="helicopters()" matSort (matSortChange)="onSort($event)" class="full-width">
          <ng-container matColumnDef="registrationNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Numer rejestracyjny</th>
            <td mat-cell *matCellDef="let row">{{ row.registrationNumber }}</td>
          </ng-container>

          <ng-container matColumnDef="helicopterType">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Typ helikoptera</th>
            <td mat-cell *matCellDef="let row">{{ row.helicopterType }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let row">
              <app-status-badge [status]="row.status === 'active' ? 'Aktywny' : 'Nieaktywny'" />
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              class="clickable-row" (click)="onRowClick(row)"></tr>
        </table>

        @if (helicopters().length === 0) {
          <div class="empty-state">Brak helikopterów</div>
        }
      }
    </mat-card>
  `,
  styles: [`
    @use 'styles/variables' as v;

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h2 { font-size: 22px; font-weight: 700; color: v.$primary-navy; }
    }

    .full-width { width: 100%; }
    .loading { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 40px; color: v.$text-muted; }
    .clickable-row { cursor: pointer; &:hover { background: #f5f7fa; } }

    button[mat-raised-button] {
      background-color: v.$primary-navy !important;
    }
  `]
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
