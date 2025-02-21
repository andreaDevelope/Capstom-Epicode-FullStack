import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, Observable, tap } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { iAccessData } from '../interfaces/i-access-data';
import { iLoginRequest } from '../interfaces/i-login-request';
import { CookieService } from 'ngx-cookie-service';
import { iUserBase } from '../interfaces/i-user-base';
import { environment } from '../environments/environment-develop';
import { iMentor } from '../interfaces/i-mentor';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  signupUrl: string = environment.registerUrl;
  loginUrl: string = environment.loginUrl;

  authSubject$ = new BehaviorSubject<iAccessData | null>(null);

  user$ = this.authSubject$.asObservable().pipe(
    tap((accessData) => (this.isLoggedIn = !!accessData)),
    map((accessData) => {
      if (!accessData) return null;
      return {
        ...accessData.user,
        ruolo: accessData.user.ruolo.startsWith('ROLE_')
          ? accessData.user.ruolo
          : `ROLE_${accessData.user.ruolo.toUpperCase()}`,
      };
    })
  );

  isLoggedIn$ = this.authSubject$.pipe(map((accessData) => !!accessData));
  isLoggedIn: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.restoreUser();
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(
      `${environment.sapientPlusBaseUrl}/api/auth/verify-email?token=${token}`
    );
  }

  register(newUser: Partial<iUserBase>): Observable<iAccessData> {
    return this.http.post<iAccessData>(this.signupUrl, newUser).pipe(
      tap((response) => {
        if (response.token) {
          this.cookieService.set(
            'temp_token',
            response.token,
            1,
            '/',
            '',
            true,
            'Lax'
          );
          console.log(
            '[DEBUG] Token salvato nei cookie:',
            this.getTemporaryToken()
          );

          this.authSubject$.next(response);

          this.cookieService.set(
            'accessData',
            JSON.stringify(response),
            1,
            '/',
            '',
            true,
            'Strict'
          );
        } else {
          console.log(
            '[INFO] Nessun token ricevuto: l’utente non è verificato.'
          );
        }
      })
    );
  }

  async getUsername(): Promise<string | null> {
    try {
      const username = await firstValueFrom(
        this.user$.pipe(
          map((user) => user?.username || null),
          filter((username) => !!username),
          take(1),
          tap((username) => console.log('getUsername restituisce:', username))
        )
      );

      return username;
    } catch (error) {
      console.error('Errore in getUsername:', error);
      return null;
    }
  }

  updatePrimoLogin(primoLogin: boolean) {
    const accessDataString = this.cookieService.get('accessData');
    if (accessDataString) {
      try {
        let parsedAccessData = JSON.parse(accessDataString);
        parsedAccessData.primoLogin = primoLogin;

        this.cookieService.set(
          'accessData',
          JSON.stringify(parsedAccessData),
          1,
          '/'
        );

        this.authSubject$.next(parsedAccessData);
      } catch (error) {
        console.error('Errore nell’aggiornamento di primoLogin:', error);
      }
    }
  }

  login(authData: iLoginRequest): Observable<iAccessData> {
    return this.http.post<iAccessData>(this.loginUrl, authData).pipe(
      tap((accessData) => {
        if (!accessData.user.emailVerificata) {
          console.error('Email non verificata!');
          alert('Devi verificare la tua email prima di accedere.');
          return;
        }
        this.authSubject$.next(accessData);

        if (!accessData || !accessData.user || !accessData.token) {
          console.error('Errore: accessData non contiene utente o token!');
          return;
        }

        this.cookieService.set(
          'accessData',
          JSON.stringify({
            ...accessData,
            primoLogin: accessData.primoLogin,
          }),
          1,
          '/',
          '',
          true,
          'Strict'
        );
      })
    );
  }

  isMentorWithoutSubscription(): boolean {
    const user = this.authSubject$.getValue()?.user;
    return user?.ruolo === 'ROLE_MENTOR' && !user?.abbonamentoAttivo;
  }

  logout() {
    this.authSubject$.next(null);
    this.cookieService.delete('accessData', '/');
    this.router.navigate(['']);
  }

  restoreUser() {
    const userJson: string = this.cookieService.get('accessData');

    if (!userJson) {
      this.authSubject$.next(null);
      return;
    }

    try {
      const accessData: iAccessData = JSON.parse(userJson);

      this.authSubject$.next(accessData);
    } catch (error) {
      console.error('Errore parsing JSON da cookie:', error);
      this.authSubject$.next(null);
    }
  }

  getTemporaryToken(): string | null {
    return this.cookieService.get('temp_token') || null;
  }

  clearTemporaryToken(): void {
    this.cookieService.delete('temp_token', '/');
  }

  getToken(): string | null {
    const accessData = this.cookieService.get('accessData');
    if (!accessData) return null;

    try {
      const parsedAccessData = JSON.parse(accessData);
      return parsedAccessData.token || null;
    } catch (error) {
      console.error('Errore nel parsing del token:', error);
      return null;
    }
  }
  updateMentor(updatedUser: iMentor): void {
    const accessData = this.authSubject$.getValue();

    if (accessData) {
      const newAccessData: iAccessData = {
        ...accessData,
        user: updatedUser,
        token: accessData.token, // 🔥 Manteniamo il token per evitare undefined
        primoLogin: accessData.primoLogin,
      };

      console.log('[DEBUG] Aggiornando authSubject$', newAccessData);

      // 🔄 Aggiorna il BehaviorSubject per aggiornare l'interfaccia utente
      this.authSubject$.next(newAccessData);

      // ✅ Usa il metodo pubblico per aggiornare il cookie
      this.updateCookie(newAccessData);
    }
  }

  // ✅ Metodo pubblico per aggiornare il cookie
  updateCookie(accessData: iAccessData): void {
    this.cookieService.set(
      'accessData',
      JSON.stringify(accessData),
      1,
      '/',
      '',
      true,
      'Strict'
    );
  }

  updateUser(updatedUser: iMentor): void {
    const accessData = this.authSubject$.getValue();

    if (accessData) {
      const newAccessData = {
        ...accessData,
        user: updatedUser,
      };

      this.authSubject$.next(newAccessData);
      this.cookieService.set(
        'accessData',
        JSON.stringify(newAccessData),
        1,
        '/',
        '',
        true,
        'Strict'
      );
    }
  }

  refreshToken(): Observable<iAccessData> {
    return this.http
      .post<iAccessData>(
        `${environment.sapientPlusBaseUrl}/auth/refresh-token`,
        {},
        {
          headers: { Authorization: `Bearer ${this.getToken()}` },
        }
      )
      .pipe(
        tap((response) => {
          if (response.token) {
            this.cookieService.set(
              'accessData',
              JSON.stringify(response),
              1,
              '/',
              '',
              true,
              'Strict'
            );

            this.authSubject$.next(response);
          }
        })
      );
  }
}
