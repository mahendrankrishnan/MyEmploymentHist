import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/employment-history-list/employment-history-list.component').then(m => m.EmploymentHistoryListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'add',
    loadComponent: () => import('./components/employment-history-form/employment-history-form.component').then(m => m.EmploymentHistoryFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/employment-history-form/employment-history-form.component').then(m => m.EmploymentHistoryFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  }
];

