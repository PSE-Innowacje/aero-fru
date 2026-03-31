import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { ROLES } from '../../core/constants';
import { OperationListComponent } from './operation-list/operation-list.component';
import { OperationFormComponent } from './operation-form/operation-form.component';
import { OperationDetailComponent } from './operation-detail/operation-detail.component';

export const OPERATION_ROUTES: Routes = [
  { path: '', component: OperationListComponent },
  { path: 'new', component: OperationFormComponent, canActivate: [roleGuard(ROLES.PLANNER, ROLES.SUPERVISOR)] },
  { path: ':id', component: OperationDetailComponent },
  { path: ':id/edit', component: OperationFormComponent, canActivate: [roleGuard(ROLES.PLANNER, ROLES.SUPERVISOR)] }
];
