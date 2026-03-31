import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LandingSiteService } from '../landing-site.service';
import { LandingSite } from '../../../../core/models/landing-site.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { ROLES } from '../../../../core/constants';

@Component({
  selector: 'app-landing-site-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page-header">
      <h2>Lądowiska planowe</h2>
      @if (isAdmin()) {
        <button mat-raised-button color="primary" (click)="router.navigate(['/admin/landing-sites/new'])">
          <mat-icon>add</mat-icon> Dodaj lądowisko
        </button>
      }
    </div>

    <mat-card>
      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="sites()" matSort (matSortChange)="onSort($event)" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nazwa</th>
            <td mat-cell *matCellDef="let row">{{ row.name }}</td>
          </ng-container>

          <ng-container matColumnDef="latitude">
            <th mat-header-cell *matHeaderCellDef>Szerokość geogr.</th>
            <td mat-cell *matCellDef="let row">{{ row.latitude }}</td>
          </ng-container>

          <ng-container matColumnDef="longitude">
            <th mat-header-cell *matHeaderCellDef>Długość geogr.</th>
            <td mat-cell *matCellDef="let row">{{ row.longitude }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              class="clickable-row" (click)="onRowClick(row)"></tr>
        </table>

        @if (sites().length === 0) {
          <div class="empty-state">Brak lądowisk</div>
        }
      }
    </mat-card>
  `,
  styles: [`
    @use 'styles/variables' as v;
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h2 { font-size: 22px; font-weight: 700; color: v.$primary-navy; } }
    .full-width { width: 100%; }
    .loading { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 40px; color: v.$text-muted; }
    .clickable-row { cursor: pointer; &:hover { background: #f5f7fa; } }
    button[mat-raised-button] { background-color: v.$primary-navy !important; }
  `]
})
export class LandingSiteListComponent implements OnInit {
  private service = inject(LandingSiteService);
  private authService = inject(AuthService);
  router = inject(Router);

  sites = signal<LandingSite[]>([]);
  loading = signal(true);
  displayedColumns = ['name', 'latitude', 'longitude'];

  ngOnInit(): void {
    this.service.getAll().subscribe({
      next: data => { this.sites.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  isAdmin(): boolean { return this.authService.hasRole(ROLES.ADMIN); }

  onSort(sort: Sort): void {
    const data = [...this.sites()];
    if (!sort.active || sort.direction === '') return;
    data.sort((a, b) => {
      const aVal = String((a as unknown as Record<string, unknown>)[sort.active] ?? '');
      const bVal = String((b as unknown as Record<string, unknown>)[sort.active] ?? '');
      return (sort.direction === 'asc' ? 1 : -1) * aVal.localeCompare(bVal);
    });
    this.sites.set(data);
  }

  onRowClick(row: LandingSite): void {
    this.router.navigate(['/admin/landing-sites', row.id]);
  }
}
