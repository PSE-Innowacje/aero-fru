import { Routes } from '@angular/router';
import { LandingSiteListComponent } from './landing-site-list/landing-site-list.component';
import { LandingSiteFormComponent } from './landing-site-form/landing-site-form.component';

export const LANDING_SITE_ROUTES: Routes = [
  { path: '', component: LandingSiteListComponent },
  { path: 'new', component: LandingSiteFormComponent },
  { path: ':id', component: LandingSiteFormComponent }
];
