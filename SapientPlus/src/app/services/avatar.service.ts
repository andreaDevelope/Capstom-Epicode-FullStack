import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment-develop';

@Injectable({
  providedIn: 'root',
})
export class AvatarService {
  private avatarUrl = environment.avatarUrl;

  constructor(private http: HttpClient) {}

  uploadAvatar(file: File, userId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());

    return this.http.put(this.avatarUrl, formData);
  }
}
