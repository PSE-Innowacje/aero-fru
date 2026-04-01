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
import { FlightOrderService } from '../flight-order.service';
import { DictionaryService } from '../../../core/services/dictionary.service';
import { AuthService } from '../../../core/auth/auth.service';
import { FlightOrderListItem } from '../../../core/models/flight-order.model';
import { DictionaryItem } from '../../../core/models/dictionary.model';
import { ROLES, FLIGHT_ORDER_STATUSES } from '../../../core/constants';

@Component({
  selector: 'app-flight-order-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatProgressSpinnerModule, StatusBadgeComponent, DatePlPipe],
  templateUrl: './flight-order-list.component.html',
  styleUrl: './flight-order-list.component.scss'
})
export class FlightOrderListComponent implements OnInit {
  private service = inject(FlightOrderService);
  private dictService = inject(DictionaryService);
  private authService = inject(AuthService);
  router = inject(Router);

  orders = signal<FlightOrderListItem[]>([]);
  statuses = signal<DictionaryItem[]>([]);
  loading = signal(true);
  totalElements = signal(0);
  currentStatusId = signal<number>(FLIGHT_ORDER_STATUSES.SUBMITTED_FOR_APPROVAL);
  currentPage = 0;
  pageSize = 10;
  currentSort = 'plannedStartAt,asc';

  displayedColumns = ['flightOrderNumber', 'plannedStartAt', 'helicopter', 'pilot', 'status'];

  ngOnInit(): void {
    this.dictService.getFlightOrderStatuses().subscribe(s => this.statuses.set(s));
    this.loadData();
  }

  canCreate(): boolean { return this.authService.hasRole(ROLES.PILOT); }

  loadData(): void {
    this.loading.set(true);
    this.service.getAll(this.currentStatusId(), this.currentPage, this.pageSize, this.currentSort).subscribe({
      next: page => { this.orders.set(page.content); this.totalElements.set(page.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onStatusFilterChange(statusId: unknown): void { this.currentStatusId.set(statusId as number); this.currentPage = 0; this.loadData(); }
  onSort(sort: Sort): void { this.currentSort = sort.active && sort.direction ? `${sort.active},${sort.direction}` : 'plannedStartAt,asc'; this.loadData(); }
  onPageChange(event: PageEvent): void { this.currentPage = event.pageIndex; this.pageSize = event.pageSize; this.loadData(); }
  onRowClick(row: FlightOrderListItem): void { this.router.navigate(['/flight-orders', row.id]); }
}
