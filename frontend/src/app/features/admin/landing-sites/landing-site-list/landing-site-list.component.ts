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
  templateUrl: './landing-site-list.component.html',
  styleUrl: './landing-site-list.component.scss'
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
