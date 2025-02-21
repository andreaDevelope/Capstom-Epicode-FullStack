import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { MentorDetailsResponse } from '../../interfaces/i-mentor-details-response';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';
import { iMentor } from '../../interfaces/i-mentor';
import { iStudent } from '../../interfaces/i-student';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-mentor-profile-view',
  templateUrl: './mentor-profile-view.component.html',
  styleUrls: ['./mentor-profile-view.component.scss'],
})
export class MentorProfileViewComponent implements OnInit {
  mentor!: iMentor | iStudent;
  mentorProfile: MentorDetailsResponse | null = null;
  isDarkMode!: boolean;

  @ViewChild('sidenavContainer') sidenavContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    const mentorId = Number(this.route.snapshot.paramMap.get('id'));
    this.isDarkMode = this.cookieService.get('darkMode') === 'true';
    if (mentorId) {
      forkJoin({
        mentorData: this.studentService.getMentorById(mentorId),
        mentorProfileData: this.studentService.getMentorProfileById(mentorId),
      }).subscribe({
        next: ({ mentorData, mentorProfileData }) => {
          this.mentor = mentorData;
          this.mentorProfile = mentorProfileData;
        },
        error: (err) => console.error('Errore nel recupero dei dati:', err),
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
