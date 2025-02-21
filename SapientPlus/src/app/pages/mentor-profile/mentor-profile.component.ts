import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MentorService } from '../../services/mentor.service';
import { MentorDetailsResponse } from '../../interfaces/i-mentor-details-response';
import { AuthService } from '../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-mentor-profile',
  templateUrl: './mentor-profile.component.html',
  styleUrls: ['./mentor-profile.component.scss'],
})
export class MentorProfileComponent implements OnInit {
  mentor!: MentorDetailsResponse;
  formattedUsername: string = '';
  editingField: string | null = null;
  isDarkMode!: boolean;

  @ViewChild('sidenavContainer') sidenavContainer!: ElementRef;

  constructor(
    private mentorService: MentorService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      this.isDarkMode = this.cookieService.get('darkMode') === 'true';
      if (!user || !user.username) {
        console.error('Nessun utente autenticato!');
        return;
      }

      this.mentorService.getMentorProfileByUsername(user.username).subscribe({
        next: (data) => {
          this.mentor = data;
          this.formattedUsername = `@${this.mentor.username}`;
        },
        error: (err) => {
          console.error('Errore nel recupero del profilo mentor:', err);
        },
      });
    });
  }

  getFormattedValue(value: string | undefined | null): string {
    return value ?? 'Non specificato';
  }

  getFormattedTariffa(value: number | undefined): string {
    return value !== undefined && value > 0
      ? `${value} €/ora`
      : 'Non specificata';
  }

  enableEditing(field: string): void {
    this.editingField = field;
  }

  saveField(field: string, value: string | number): void {
    this.mentorService.updateField(this.mentor.id, field, value).subscribe(
      (updatedMentor) => {
        this.mentor = updatedMentor;
        this.editingField = null;
        this.router.navigateByUrl('/mentor-home');
      },
      (error) => {
        console.error('Errore durante il salvataggio:', error);
      }
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
