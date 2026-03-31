import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DatePlPipe } from '../../../shared/pipes/date-pl.pipe';
import { OperationService } from '../operation.service';
import { DictionaryService } from '../../../core/services/dictionary.service';
import { AuthService } from '../../../core/auth/auth.service';
import { OperationListItem } from '../../../core/models/operation.model';
import { DictionaryItem } from '../../../core/models/dictionary.model';
import { ROLES, OPERATION_STATUSES } from '../../../core/constants';

@Component({
  selector: 'app-operation-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule, StatusBadgeComponent, DatePlPipe],
  template: `
    <div class="page-header">
      <h2>Lista operacji</h2>
      <div class="header-actions">
        <mat-form-field appearance="outline" class="status-filter">
          <mat-label>Status</mat-label>
          <mat-select [value]="currentStatusId()" (selectionChange)="onStatusFilterChange($event.value)">
            <mat-option [value]="0">Wszystkie</mat-option>
            @for (status of statuses(); track status.id) {
              <mat-option [value]="status.id">{{ status.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (canCreate()) {
          <button mat-raised-button color="primary" (click)="router.navigate(['/operations/new'])">
            <mat-icon>add</mat-icon> Dodaj operację
          </button>
        }
      </div>
    </div>

    <mat-card>
      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="operations()" matSort (matSortChange)="onSort($event)" class="full-width">
          <ng-container matColumnDef="operationNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nr operacji</th>
            <td mat-cell *matCellDef="let row">{{ row.operationNumber }}</td>
          </ng-container>

          <ng-container matColumnDef="orderProjectNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nr zlecenia</th>
            <td mat-cell *matCellDef="let row">{{ row.orderProjectNumber }}</td>
          </ng-container>

          <ng-container matColumnDef="activityTypes">
            <th mat-header-cell *matHeaderCellDef>Rodzaj czynności</th>
            <td mat-cell *matCellDef="let row">{{ row.activityTypes?.join(', ') }}</td>
          </ng-container>

          <ng-container matColumnDef="proposedDates">
            <th mat-header-cell *matHeaderCellDef>Proponowane daty</th>
            <td mat-cell *matCellDef="let row">
              {{ row.proposedDateEarliest | datePl }} – {{ row.proposedDateLatest | datePl }}
            </td>
          </ng-container>

          <ng-container matColumnDef="plannedDates">
            <th mat-header-cell *matHeaderCellDef>Planowane daty</th>
            <td mat-cell *matCellDef="let row">
              {{ row.plannedDateEarliest | datePl }} – {{ row.plannedDateLatest | datePl }}
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let row">
              <app-status-badge [status]="row.status" />
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              class="clickable-row" (click)="onRowClick(row)"></tr>
        </table>

        @if (operations().length === 0) {
          <div class="empty-state">Brak operacji</div>
        }

        <mat-paginator
          [length]="totalElements()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPageChange($event)">
        </mat-paginator>
      }
    </mat-card>
  `,
  styles: [`
    @use 'styles/variables' as v;
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
      h2 { font-size: 22px; font-weight: 700; color: v.$primary-navy; }
    }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .status-filter { width: 220px; }
    .full-width { width: 100%; }
    .loading { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 40px; color: v.$text-muted; }
    .clickable-row { cursor: pointer; &:hover { background: #f5f7fa; } }
    button[mat-raised-button] { background-color: v.$primary-navy !important; }
  `]
})
export class OperationListComponent implements OnInit {
  private service = inject(OperationService);
  private dictService = inject(DictionaryService);
  private authService = inject(AuthService);
  router = inject(Router);

  operations = signal<OperationListItem[]>([]);
  statuses = signal<DictionaryItem[]>([]);
  loading = signal(true);
  totalElements = signal(0);
  currentStatusId = signal<number>(OPERATION_STATUSES.CONFIRMED);
  currentPage = 0;
  pageSize = 10;
  currentSort = 'plannedDateEarliest,asc';

  displayedColumns = ['operationNumber', 'orderProjectNumber', 'activityTypes', 'proposedDates', 'plannedDates', 'status'];

  ngOnInit(): void {
    this.dictService.getOperationStatuses().subscribe(s => this.statuses.set(s));
    this.loadData();
  }

  canCreate(): boolean {
    return this.authService.hasRole(ROLES.PLANNER, ROLES.SUPERVISOR);
  }

  loadData(): void {
    this.loading.set(true);
    this.service.getAll(this.currentStatusId(), this.currentPage, this.pageSize, this.currentSort).subscribe({
      next: page => {
        this.operations.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onStatusFilterChange(statusId: unknown): void {
    this.currentStatusId.set(statusId as number);
    this.currentPage = 0;
    this.loadData();
  }

  onSort(sort: Sort): void {
    if (sort.active && sort.direction) {
      this.currentSort = `${sort.active},${sort.direction}`;
    } else {
      this.currentSort = 'plannedDateEarliest,asc';
    }
    this.loadData();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onRowClick(row: OperationListItem): void {
    this.router.navigate(['/operations', row.id]);
  }
}
