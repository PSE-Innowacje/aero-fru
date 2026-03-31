import { Routes } from '@angular/router';
import { CrewMemberListComponent } from './crew-member-list/crew-member-list.component';
import { CrewMemberFormComponent } from './crew-member-form/crew-member-form.component';

export const CREW_MEMBER_ROUTES: Routes = [
  { path: '', component: CrewMemberListComponent },
  { path: 'new', component: CrewMemberFormComponent },
  { path: ':id', component: CrewMemberFormComponent }
];
