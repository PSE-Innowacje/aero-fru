import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <mat-toolbar class="header">
      <button mat-icon-button (click)="toggleSidebar.emit()">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="spacer"></span>

      @if (authService.currentUser(); as user) {
        <div class="user-info">
          <mat-icon class="user-avatar">account_circle</mat-icon>
          <div class="user-details">
            <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
            <span class="user-role">{{ user.role }}</span>
          </div>
        </div>

        <button mat-icon-button (click)="authService.logout()" matTooltip="Wyloguj">
          <mat-icon>logout</mat-icon>
        </button>
      }
    </mat-toolbar>
  `,
  styles: [`
    @use 'styles/variables' as v;

    .header {
      background: v.$bg-white;
      color: v.$text-dark;
      border-bottom: 1px solid v.$border-color;
      height: v.$header-height;
      padding: 0 16px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .spacer {
      flex: 1;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: 8px;
    }

    .user-avatar {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: v.$accent-blue;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      line-height: 1.3;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
    }

    .user-role {
      font-size: 11px;
      color: v.$text-muted;
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  toggleSidebar = output<void>();
}
