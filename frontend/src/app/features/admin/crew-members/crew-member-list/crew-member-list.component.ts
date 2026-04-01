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
  templateUrl: './crew-member-list.component.html',
  styleUrl: './crew-member-list.component.scss'
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
