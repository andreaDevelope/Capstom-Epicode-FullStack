import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MentorDetailsResponse } from '../interfaces/i-mentor-details-response';
import { iMentor } from '../interfaces/i-mentor';
import { environment } from '../environments/environment-develop';

@Injectable({
  providedIn: 'root',
})
export class MentorService {
  private mentorProfileUrl = `${environment.sapientPlusBaseUrl}/mentor-profile`;
  private updateMentorUrl = `${environment.updateMentorUrl}`;
  private baseUrl = environment.sapientPlusBaseUrl;
  private updateFieldUrl = 'http://localhost:8080/api/mentor-profile';

  constructor(private http: HttpClient) {}

  getMentorDetails(id: number): Observable<MentorDetailsResponse> {
    return this.http.get<MentorDetailsResponse>(
      `${this.mentorProfileUrl}/${id}`
    );
  }

  getMentorProfile(id: number): Observable<MentorDetailsResponse> {
    return this.http.get<MentorDetailsResponse>(
      `${this.mentorProfileUrl}/details/${id}`
    );
  }

  updateProfile(userData: Partial<iMentor>, id: number): Observable<iMentor> {
    const payload = {
      ...userData,
      materie: userData.materie?.map((materia) => ({
        id: materia.id || null,
        nome: materia.nome,
        livello: materia.livello,
        user: { id },
      })),
    };

    return this.http.put<iMentor>(`${this.updateMentorUrl}/${id}`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  getMentorById(id: number): Observable<iMentor> {
    return this.http.get<iMentor>(`${this.baseUrl}/${id}/or-create`);
  }

  getMentorProfileByUsername(
    username: string
  ): Observable<MentorDetailsResponse> {
    return this.http.get<MentorDetailsResponse>(
      `${this.mentorProfileUrl}/username/${username}`
    );
  }

  updateField(
    mentorId: number,
    fieldName: string,
    fieldValue: string | number
  ): Observable<MentorDetailsResponse> {
    return this.http.patch<MentorDetailsResponse>(
      `${this.updateFieldUrl}/${mentorId}/update-field?fieldName=${fieldName}&fieldValue=${fieldValue}`,
      {},
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getUpdatedMentor(username: string): Observable<iMentor> {
    return this.http.get<iMentor>(`${this.baseUrl}/user/refresh/${username}`);
  }

  getMentorNotifications(mentorId: number): Observable<
    {
      read: any;
      id: number;
      content: string;
    }[]
  > {
    return this.http.get<any[]>(`${this.baseUrl}/notifications/${mentorId}`);
  }

  markNotificationsAsRead(mentorId: number): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/notifications/read/${mentorId}`,
      {}
    );
  }
}
