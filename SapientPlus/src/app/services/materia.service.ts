// src/app/services/materia.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment-develop';

export interface iMateria {
  id?: number;
  nome: string;
  livello: string;
}

@Injectable({
  providedIn: 'root',
})
export class MateriaService {
  private apiBaseUrl = environment.sapientPlusBaseUrl;
  private endpoint = '/materie';

  constructor(private http: HttpClient) {}

  getAllMaterie(): Observable<iMateria[]> {
    return this.http.get<iMateria[]>(`${this.apiBaseUrl}/materie`, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  createMateria(materia: iMateria): Observable<iMateria> {
    return this.http.post<iMateria>(
      `${this.apiBaseUrl}${this.endpoint}`,
      materia
    );
  }
}
