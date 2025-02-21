import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },

  {
    path: 'welcome',
    loadChildren: () =>
      import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
    canActivate: [authGuard],
  },

  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginModule),
    canActivate: [authGuard],
  },

  {
    path: 'abbonamento',
    loadChildren: () =>
      import('./pages/abbonamento/abbonamento.module').then(
        (m) => m.AbbonamentoModule
      ),
  },

  {
    path: 'student-home',
    loadChildren: () =>
      import('./pages/student-home/student-home.module').then(
        (m) => m.StudentHomeModule
      ),
    canActivate: [authGuard],
  },

  {
    path: 'mentor-home',
    loadChildren: () =>
      import('./pages/mentor-home/mentor-home.module').then(
        (m) => m.MentorHomeModule
      ),
    canActivate: [authGuard],
  },

  {
    path: 'admin-home',
    loadChildren: () =>
      import('./pages/admin-home/admin-home.module').then(
        (m) => m.AdminHomeModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./pages/profilo/profilo.module').then((m) => m.ProfiloModule),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./pages/impostazioni/impostazioni.module').then(
        (m) => m.ImpostazioniModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'mentor-profile',
    loadChildren: () =>
      import('./pages/mentor-profile/mentor-profile.module').then(
        (m) => m.MentorProfileModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'mentor-profile-view/:id',
    loadChildren: () =>
      import('./pages/mentor-profile-view/mentor-profile-view.module').then(
        (m) => m.MentorProfileViewModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'verify-email',
    loadChildren: () =>
      import('./pages/verify-email/verify-email.module').then(
        (m) => m.VerifyEmailModule
      ),
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
