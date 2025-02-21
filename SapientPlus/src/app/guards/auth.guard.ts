import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const cookieService = inject(CookieService);

  const accessData = cookieService.get('accessData');
  let userRole: string = '';
  let parsedAccessData: any = null;
  let isLoggedIn = false;

  try {
    if (accessData) {
      parsedAccessData = JSON.parse(accessData);
      isLoggedIn = !!parsedAccessData?.token && !!parsedAccessData?.user;
      userRole = parsedAccessData?.user?.ruolo;
    }
  } catch (error) {
    isLoggedIn = false;
  }

  const guestRoutes = ['/welcome', '/login'];
  const protectedRoutes = [
    '/student-home',
    '/mentor-home',
    '/admin-home',
    '/profile',
    '/settings',
    '/mentor-profile',
    '/mentor-profile-view',
  ];

  if (!isLoggedIn) {
    if (protectedRoutes.includes(state.url.toLowerCase())) {
      router
        .navigate(['/login'])
        .catch((err) => console.error('ERRORE DI NAVIGAZIONE:', err));
      return false;
    }
    return true;
  }

  if (guestRoutes.includes(state.url.toLowerCase())) {
    const homeRoutes: Record<string, string> = {
      ROLE_STUDENT: '/student-home',
      ROLE_MENTOR: '/mentor-home',
      ROLE_ADMIN: '/admin-home',
    };
    router
      .navigate([homeRoutes[userRole] || '/'])
      .catch((err) => console.error('ERRORE DI NAVIGAZIONE:', err));
    return false;
  }

  if (
    state.url.toLowerCase() === '/abbonamento' ||
    state.url.toLowerCase() === '/verify-email'
  ) {
    return true;
  }

  if (!parsedAccessData?.user?.emailVerificata) {
    console.warn('Accesso bloccato: email non verificata');
    router
      .navigate(['/verify-email'])
      .catch((err) => console.error('ERRORE DI NAVIGAZIONE:', err));
    return false;
  }

  if (
    userRole === 'ROLE_MENTOR' &&
    !parsedAccessData?.user?.abbonamentoAttivo
  ) {
    console.warn(
      'Mentor senza abbonamento: reindirizzamento alla pagina di pagamento.'
    );
    router
      .navigate(['/abbonamento'])
      .catch((err) => console.error('ERRORE DI NAVIGAZIONE:', err));
    return false;
  }

  const roleBasedRoutes: Record<string, string[]> = {
    ROLE_STUDENT: ['/student-home', '/profile', '/mentor-profile-view'],
    ROLE_MENTOR: ['/mentor-home', '/mentor-profile'],
    ROLE_ADMIN: ['/admin-home'],
  };

  const currentUrl = state.url.toLowerCase();

  if (currentUrl === '/settings') {
    return true;
  }

  if (
    !roleBasedRoutes[userRole]?.some((route) => currentUrl.startsWith(route))
  ) {
    console.warn(
      'Accesso negato: la pagina non è accessibile per il ruolo attuale'
    );
    router
      .navigate(['/'])
      .catch((err) => console.error('ERRORE DI NAVIGAZIONE:', err));
    return false;
  }

  return true;
};
