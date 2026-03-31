import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar [collapsed]="sidebarCollapsed()" (toggle)="sidebarCollapsed.set(!sidebarCollapsed())" />
      <div class="main-area" [class.sidebar-collapsed]="sidebarCollapsed()">
        <app-header (toggleSidebar)="sidebarCollapsed.set(!sidebarCollapsed())" />
        <main class="content-area">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    @use 'styles/variables' as v;

    .app-layout {
      display: flex;
      min-height: 100vh;
    }

    .main-area {
      flex: 1;
      margin-left: v.$sidebar-width;
      transition: margin-left 0.3s ease;
      display: flex;
      flex-direction: column;
      min-height: 100vh;

      &.sidebar-collapsed {
        margin-left: v.$sidebar-collapsed-width;
      }
    }

    .content-area {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }
  `]
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);
}
