import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { ROLES } from '../../core/constants';
import { FlightOrderListComponent } from './flight-order-list/flight-order-list.component';
import { FlightOrderFormComponent } from './flight-order-form/flight-order-form.component';
import { FlightOrderDetailComponent } from './flight-order-detail/flight-order-detail.component';

export const FLIGHT_ORDER_ROUTES: Routes = [
  { path: '', component: FlightOrderListComponent },
  { path: 'new', component: FlightOrderFormComponent, canActivate: [roleGuard(ROLES.PILOT)] },
  { path: ':id', component: FlightOrderDetailComponent },
  { path: ':id/edit', component: FlightOrderFormComponent, canActivate: [roleGuard(ROLES.PILOT, ROLES.SUPERVISOR)] }
];
