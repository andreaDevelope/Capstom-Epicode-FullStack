import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { iRecensione } from '../interfaces/i-recensione';
import { iRecensioneRequest } from '../interfaces/i-recensione-request';
import { environment } from '../environments/environment-develop';

@Injectable({
  providedIn: 'root',
})
export class RecensioneService {
  private recensioniUrl = environment.recensioniUrl;

  constructor(private http: HttpClient) {}

  getRecensioniByMentor(mentorId: number): Observable<iRecensione[]> {
    return this.http.get<iRecensione[]>(`${this.recensioniUrl}/${mentorId}`);
  }

  getMediaRecensioni(mentorId: number): Observable<number> {
    return this.http.get<number>(`${this.recensioniUrl}/media/${mentorId}`);
  }

  aggiungiRecensione(
    studenteId: number,
    recensione: iRecensioneRequest
  ): Observable<iRecensione> {
    return this.http.post<iRecensione>(
      `${this.recensioniUrl}/aggiungi/${studenteId}`,
      recensione
    );
  }
}
