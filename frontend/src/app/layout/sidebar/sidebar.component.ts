import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { ROLES } from '../../core/constants';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <nav class="sidebar" [class.collapsed]="collapsed()">
      <div class="sidebar-header">
        <mat-icon class="logo-icon">flight</mat-icon>
        @if (!collapsed()) {
          <div class="app-brand">
            <span class="app-title">AERO FRU</span>
            <span class="app-subtitle">Operacje lotnicze</span>
          </div>
        }
      </div>

      <div class="nav-sections">
        @if (canSeeAdmin()) {
          <div class="nav-section">
            @if (!collapsed()) {
              <div class="section-label">Administracja</div>
            }
            <a routerLink="/admin/helicopters" routerLinkActive="active" class="nav-item">
              <mat-icon>flight</mat-icon>
              @if (!collapsed()) { <span>Helikoptery</span> }
            </a>
            <a routerLink="/admin/crew-members" routerLinkActive="active" class="nav-item">
              <mat-icon>people</mat-icon>
              @if (!collapsed()) { <span>Członkowie załogi</span> }
            </a>
            <a routerLink="/admin/landing-sites" routerLinkActive="active" class="nav-item">
              <mat-icon>flight_land</mat-icon>
              @if (!collapsed()) { <span>Lądowiska planowe</span> }
            </a>
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
              <mat-icon>admin_panel_settings</mat-icon>
              @if (!collapsed()) { <span>Użytkownicy</span> }
            </a>
          </div>
        }

        <div class="nav-section">
          @if (!collapsed()) {
            <div class="section-label">Planowanie operacji</div>
          }
          <a routerLink="/operations" routerLinkActive="active" class="nav-item">
            <mat-icon>assignment</mat-icon>
            @if (!collapsed()) { <span>Lista operacji</span> }
          </a>
        </div>

        @if (canSeeFlightOrders()) {
          <div class="nav-section">
            @if (!collapsed()) {
              <div class="section-label">Zlecenia na lot</div>
            }
            <a routerLink="/flight-orders" routerLinkActive="active" class="nav-item">
              <mat-icon>description</mat-icon>
              @if (!collapsed()) { <span>Lista zleceń</span> }
            </a>
          </div>
        }
      </div>

      <div class="sidebar-footer">
        <button class="toggle-btn" (click)="toggle.emit()">
          <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    @use 'styles/variables' as v;

    .sidebar {
      width: v.$sidebar-width;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      background: v.$sidebar-gradient;
      color: #ffffff;
      box-shadow: v.$sidebar-shadow;
      transition: width 0.3s ease;
      z-index: 1000;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;

      &.collapsed {
        width: v.$sidebar-collapsed-width;
      }
    }

    .sidebar-header {
      padding: 20px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      min-height: 72px;

      .logo-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        flex-shrink: 0;
      }
    }

    .app-brand {
      display: flex;
      flex-direction: column;
      white-space: nowrap;
    }

    .app-title {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 1.5px;
    }

    .app-subtitle {
      font-size: 11px;
      opacity: 0.6;
      font-weight: 300;
    }

    .nav-sections {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .nav-section {
      padding: 4px 0;

      &:not(:last-child) {
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
    }

    .section-label {
      padding: 16px 16px 8px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      opacity: 0.5;
      font-weight: 600;
      white-space: nowrap;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      border-radius: v.$border-radius-sm;
      margin: 2px 8px;
      transition: all 0.2s ease;
      white-space: nowrap;
      font-size: 13.5px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        text-decoration: none;
      }

      &.active {
        background: rgba(255, 255, 255, 0.18);
        color: #ffffff;
        font-weight: 600;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        opacity: 0.9;
      }
    }

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);

      .toggle-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        padding: 8px;
        border-radius: v.$border-radius-sm;
        width: 100%;
        display: flex;
        justify-content: center;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
      }
    }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);

  collapsed = input(false);
  toggle = output<void>();

  canSeeAdmin(): boolean {
    return !this.authService.hasRole(ROLES.PLANNER);
  }

  canSeeFlightOrders(): boolean {
    return !this.authService.hasRole(ROLES.PLANNER);
  }
}
