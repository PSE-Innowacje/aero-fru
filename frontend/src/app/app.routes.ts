import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { ROLES } from './core/constants';
import { LoginComponent } from './core/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'operations', pathMatch: 'full' },
      {
        path: 'admin',
        children: [
          { path: '', redirectTo: 'helicopters', pathMatch: 'full' },
          {
            path: 'helicopters',
            loadChildren: () => import('./features/admin/helicopters/helicopter.routes').then(m => m.HELICOPTER_ROUTES)
          },
          {
            path: 'crew-members',
            loadChildren: () => import('./features/admin/crew-members/crew-member.routes').then(m => m.CREW_MEMBER_ROUTES)
          },
          {
            path: 'landing-sites',
            loadChildren: () => import('./features/admin/landing-sites/landing-site.routes').then(m => m.LANDING_SITE_ROUTES)
          },
          {
            path: 'users',
            loadChildren: () => import('./features/admin/users/user.routes').then(m => m.USER_ROUTES)
          }
        ]
      },
      {
        path: 'operations',
        loadChildren: () => import('./features/operations/operation.routes').then(m => m.OPERATION_ROUTES)
      },
      {
        path: 'flight-orders',
        loadChildren: () => import('./features/flight-orders/flight-order.routes').then(m => m.FLIGHT_ORDER_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
