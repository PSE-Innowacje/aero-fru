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
  template: `
    <div class="page-header">
      <h2>Lista zleceń na lot</h2>
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
          <button mat-raised-button color="primary" (click)="router.navigate(['/flight-orders/new'])">
            <mat-icon>add</mat-icon> Dodaj zlecenie
          </button>
        }
      </div>
    </div>

    <mat-card>
      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="orders()" matSort (matSortChange)="onSort($event)" class="full-width">
          <ng-container matColumnDef="flightOrderNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nr zlecenia</th>
            <td mat-cell *matCellDef="let row">{{ row.flightOrderNumber }}</td>
          </ng-container>

          <ng-container matColumnDef="plannedStartAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Planowany start</th>
            <td mat-cell *matCellDef="let row">{{ row.plannedStartAt | datePl:'datetime' }}</td>
          </ng-container>

          <ng-container matColumnDef="helicopter">
            <th mat-header-cell *matHeaderCellDef>Helikopter</th>
            <td mat-cell *matCellDef="let row">{{ row.helicopter }}</td>
          </ng-container>

          <ng-container matColumnDef="pilot">
            <th mat-header-cell *matHeaderCellDef>Pilot</th>
            <td mat-cell *matCellDef="let row">{{ row.pilot }}</td>
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

        @if (orders().length === 0) {
          <div class="empty-state">Brak zleceń</div>
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
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; h2 { font-size: 22px; font-weight: 700; color: v.$primary-navy; } }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .status-filter { width: 220px; }
    .full-width { width: 100%; }
    .loading { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 40px; color: v.$text-muted; }
    .clickable-row { cursor: pointer; &:hover { background: #f5f7fa; } }
    button[mat-raised-button] { background-color: v.$primary-navy !important; }
  `]
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
