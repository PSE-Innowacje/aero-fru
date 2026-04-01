import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../user.service';
import { UserListItem } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { ROLES } from '../../../../core/constants';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  private service = inject(UserService);
  private authService = inject(AuthService);
  router = inject(Router);

  users = signal<UserListItem[]>([]);
  loading = signal(true);
  displayedColumns = ['email', 'role'];

  ngOnInit(): void {
    this.service.getAll().subscribe({
      next: data => { this.users.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  isAdmin(): boolean { return this.authService.hasRole(ROLES.ADMIN); }

  onSort(sort: Sort): void {
    const data = [...this.users()];
    if (!sort.active || sort.direction === '') return;
    data.sort((a, b) => {
      const aVal = String((a as unknown as Record<string, unknown>)[sort.active] ?? '');
      const bVal = String((b as unknown as Record<string, unknown>)[sort.active] ?? '');
      return (sort.direction === 'asc' ? 1 : -1) * aVal.localeCompare(bVal);
    });
    this.users.set(data);
  }

  onRowClick(row: UserListItem): void {
    this.router.navigate(['/admin/users', row.id]);
  }
}
