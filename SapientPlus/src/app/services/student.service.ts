import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { iMentor } from '../interfaces/i-mentor';
import { iStudent } from '../interfaces/i-student';
import { environment } from '../environments/environment-develop';
import { MentorDetailsResponse } from '../interfaces/i-mentor-details-response';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private mentorsSubject = new BehaviorSubject<iMentor[]>([]);
  mentors$ = this.mentorsSubject.asObservable();

  private apiUrl = environment.sapientPlusBaseUrl;
  private getAllMentorsUrl = environment.getAllMentorsUrl;

  constructor(private http: HttpClient) {}

  getAllMentors(): void {
    this.http.get<iMentor[]>(this.getAllMentorsUrl).subscribe({
      next: (data) => {
        this.mentorsSubject.next(data);
      },
      error: (error) => {
        if (error.status === 401 || error.status === 403) {
          console.warn(
            'Utente non autenticato, riprovo dopo autenticazione...'
          );
        } else {
          console.error('Errore nel recupero dei mentor:', error);
        }
      },
    });
  }

  updateProfile(
    studentData: Partial<iStudent>,
    id: number
  ): Observable<iStudent> {
    return this.http.put<iStudent>(`${this.apiUrl}/${id}`, studentData, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getMentorById(id: number): Observable<iMentor | iStudent> {
    return this.http.get<iMentor | iStudent>(`${this.apiUrl}/${id}`);
  }

  getMentorProfileById(id: number): Observable<MentorDetailsResponse> {
    return this.http.get<MentorDetailsResponse>(
      `${this.apiUrl}/mentor-profile/${id}/or-create`
    );
  }

  addFavorite(mentorId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/favorites/add`, { mentorId });
  }

  removeFavorite(studentId: number, mentorId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favorites/${mentorId}`);
  }

  getFavorites(): Observable<iMentor[]> {
    return this.http.get<iMentor[]>(`${this.apiUrl}/favorites`);
  }

  getMentorsWithCommonSubjects(studentId: number): Observable<iMentor[]> {
    return this.http.get<iMentor[]>(
      `${this.apiUrl}/mentors/matching/${studentId}`
    );
  }
}
