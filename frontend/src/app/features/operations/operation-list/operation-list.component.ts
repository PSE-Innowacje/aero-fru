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
  templateUrl: './operation-list.component.html',
  styleUrl: './operation-list.component.scss'
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
