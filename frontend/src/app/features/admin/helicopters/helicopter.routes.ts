import { Routes } from '@angular/router';
import { HelicopterListComponent } from './helicopter-list/helicopter-list.component';
import { HelicopterFormComponent } from './helicopter-form/helicopter-form.component';

export const HELICOPTER_ROUTES: Routes = [
  { path: '', component: HelicopterListComponent },
  { path: 'new', component: HelicopterFormComponent },
  { path: ':id', component: HelicopterFormComponent }
];
