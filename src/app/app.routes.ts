import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { StudentDetails } from './student-details';
import { Students } from './students/students';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: Dashboard,
  },
  {
    path: 'students',
    component: Students,
  },
  {
    path: 'student/:id',
    component: StudentDetails,
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
