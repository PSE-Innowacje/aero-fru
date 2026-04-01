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
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
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
