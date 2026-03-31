import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CrewMemberService } from '../crew-member.service';
import { CrewMemberListItem } from '../../../../core/models/crew-member.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { ROLES } from '../../../../core/constants';
import { DatePlPipe } from '../../../../shared/pipes/date-pl.pipe';

@Component({
  selector: 'app-crew-member-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePlPipe],
  template: `
    <div class="page-header">
      <h2>Członkowie załogi</h2>
      @if (isAdmin()) {
        <button mat-raised-button color="primary" (click)="router.navigate(['/admin/crew-members/new'])">
          <mat-icon>add</mat-icon> Dodaj członka załogi
        </button>
      }
    </div>

    <mat-card>
      @if (loading()) {
        <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
      } @else {
        <table mat-table [dataSource]="crewMembers()" matSort (matSortChange)="onSort($event)" class="full-width">
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let row">{{ row.email }}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Rola</th>
            <td mat-cell *matCellDef="let row">{{ row.role }}</td>
          </ng-container>

          <ng-container matColumnDef="licenseValidUntil">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Ważność licencji</th>
            <td mat-cell *matCellDef="let row">{{ row.licenseValidUntil | datePl }}</td>
          </ng-container>

          <ng-container matColumnDef="trainingValidUntil">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Ważność szkolenia</th>
            <td mat-cell *matCellDef="let row">{{ row.trainingValidUntil | datePl }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              class="clickable-row" (click)="onRowClick(row)"></tr>
        </table>

        @if (crewMembers().length === 0) {
          <div class="empty-state">Brak członków załogi</div>
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
export class CrewMemberListComponent implements OnInit {
  private service = inject(CrewMemberService);
  private authService = inject(AuthService);
  router = inject(Router);

  crewMembers = signal<CrewMemberListItem[]>([]);
  loading = signal(true);
  displayedColumns = ['email', 'role', 'licenseValidUntil', 'trainingValidUntil'];

  ngOnInit(): void {
    this.service.getAll().subscribe({
      next: data => { this.crewMembers.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  isAdmin(): boolean { return this.authService.hasRole(ROLES.ADMIN); }

  onSort(sort: Sort): void {
    const data = [...this.crewMembers()];
    if (!sort.active || sort.direction === '') return;
    data.sort((a, b) => {
      const aVal = String((a as unknown as Record<string, unknown>)[sort.active] ?? '');
      const bVal = String((b as unknown as Record<string, unknown>)[sort.active] ?? '');
      return (sort.direction === 'asc' ? 1 : -1) * aVal.localeCompare(bVal);
    });
    this.crewMembers.set(data);
  }

  onRowClick(row: CrewMemberListItem): void {
    this.router.navigate(['/admin/crew-members', row.id]);
  }
}
