import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { environment } from '../environments/environment-develop';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './auth.service';
import { iPayPalResponse } from '../interfaces/i-pay-pal-response';
import { iAbbonamentoResponse } from '../interfaces/i-abbonamento-response';

@Injectable({
  providedIn: 'root',
})
export class PayPalService {
  payPalUrl: string = environment.payPalUrl;
  attivaAbbonamentoUrl: string = environment.attivaAbbonamentoUrl;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private authService: AuthService
  ) {}

  createSubscriptionPlan(): Observable<iPayPalResponse> {
    return this.http.post<iPayPalResponse>(`${this.payPalUrl}`, null);
  }

  async attivaAbbonamento(): Promise<Observable<iAbbonamentoResponse>> {
    const token = this.cookieService.get('temp_token');
    if (!token) {
      console.error('Token non trovato! L’utente deve registrarsi di nuovo.');
      return EMPTY;
    }

    const username = await this.authService.getUsername();

    if (!username) {
      console.error('[DEBUG] Errore: Username non disponibile.');
      return EMPTY;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const body = { username };

    return this.http.post<iAbbonamentoResponse>(
      this.attivaAbbonamentoUrl,
      body,
      { headers }
    );
  }
}
