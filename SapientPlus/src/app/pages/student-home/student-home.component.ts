import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { StudentService } from '../../services/student.service';
import { iMentor } from '../../interfaces/i-mentor';
import { RecensioneService } from '../../services/recensione.service';
import { ReviewDialogComponent } from '../../atomic-components/review-dialog/review-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { filter, take } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-student-home',
  templateUrl: './student-home.component.html',
  styleUrls: ['./student-home.component.scss'],
})
export class StudentHomeComponent {
  mentors: iMentor[] = [];
  isLoggedIn: boolean = false;
  favorites: iMentor[] = [];
  showFavorites: boolean = false;
  isDarkMode!: boolean;

  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('sidenavContainer') sidenavContainer!: ElementRef;

  tiles = [
    { title: 'Dashboard', content: 'Statistiche e Analisi', cols: 1, rows: 1 },
    { title: 'Corsi', content: 'I tuoi corsi attivi', cols: 1, rows: 1 },
    { title: 'Messaggi', content: 'Nuovi messaggi', cols: 2, rows: 1 },
  ];

  mediaRecensioni: { [mentorId: number]: number } = {};
  recensioniCaricate: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private studentService: StudentService,
    private recensioneService: RecensioneService,
    private dialog: MatDialog,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.isDarkMode = this.cookieService.get('darkMode') === 'true';
    this.authService.user$
      .pipe(
        filter((user) => !!user),
        take(1)
      )
      .subscribe((user) => {
        this.isLoggedIn = true;

        if (user?.id) {
          this.studentService.getMentorsWithCommonSubjects(user.id).subscribe({
            next: (mentors) => {
              this.mentors = mentors;
              this.caricaRecensioni();
            },
            error: (error) => {
              console.error(
                'Errore nel recupero dei mentor con materie in comune:',
                error
              );
            },
          });

          this.studentService
            .getFavorites()
            .pipe(take(1))
            .subscribe({
              next: (favorites) => {
                this.favorites = favorites;
              },
              error: (error) => {
                console.error('Errore nel caricamento dei preferiti:', error);
              },
            });
        } else {
          console.error('Errore: Nessun utente loggato trovato.');
        }
      });
  }

  caricaDatiUtente() {
    this.studentService.getAllMentors();
    this.studentService.mentors$.pipe(take(1)).subscribe({
      next: (mentors: iMentor[]) => {
        this.mentors = mentors;
        console.log('Mentor caricati:', mentors);
      },
      error: (error) => {
        console.error('Errore nel recupero dei mentor:', error);
      },
    });

    this.studentService
      .getFavorites()
      .pipe(take(1))
      .subscribe({
        next: (favorites) => {
          this.favorites = favorites;
          console.log('Preferiti caricati:', favorites);
        },
        error: (error) => {
          console.error('Errore nel caricamento dei preferiti:', error);
        },
      });
  }

  toggleFavorite(mentor: iMentor) {
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      if (!user || !user.id) {
        console.warn(
          'Tentativo di modificare i preferiti senza utente loggato.'
        );
        return;
      }

      if (this.isFavorite(mentor)) {
        this.studentService
          .removeFavorite(user.id, mentor.id)
          .pipe(take(1))
          .subscribe(
            () => {
              this.favorites = this.favorites.filter((m) => m.id !== mentor.id);
              console.log(`Rimosso dai preferiti: ${mentor.id}`);
            },
            (error) => {
              console.error('Errore nella rimozione dei preferiti:', error);
            }
          );
      } else {
        this.studentService
          .addFavorite(mentor.id)
          .pipe(take(1))
          .subscribe(
            () => {
              this.favorites.push(mentor);
              console.log(`Aggiunto ai preferiti: ${mentor.id}`);
            },
            (error) => {
              console.error("Errore nell'aggiunta ai preferiti:", error);
            }
          );
      }
    });
  }

  isFavorite(mentor: iMentor): boolean {
    return this.favorites.some((fav) => fav.id === mentor.id);
  }

  caricaRecensioni() {
    this.recensioniCaricate = false;

    let richieste = this.mentors.map((mentor) =>
      this.recensioneService.getMediaRecensioni(mentor.id).toPromise()
    );

    Promise.all(richieste)
      .then((medie) => {
        this.mentors.forEach((mentor, index) => {
          this.mediaRecensioni[mentor.id] = medie[index] ?? 0;
        });
        this.recensioniCaricate = true;
      })
      .catch(() => {
        this.mentors.forEach((mentor) => {
          this.mediaRecensioni[mentor.id] = 0;
        });
        this.recensioniCaricate = true;
      });
  }

  getStelleArray(media: number): string[] {
    let stelle: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(media)) {
        stelle.push('star');
      } else if (i === Math.ceil(media) && media % 1 !== 0) {
        stelle.push('star_half');
      } else {
        stelle.push('star_border');
      }
    }
    return stelle;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  apriDialogRecensione(mentorId: number) {
    this.authService.user$.pipe(take(1)).subscribe((user) => {
      if (!user || !user.id) {
        console.error('Errore: Nessun studente loggato!');
        return;
      }

      const dialogRef = this.dialog.open(ReviewDialogComponent, {
        width: '400px',
        data: { mentorId, studenteId: user.id },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.caricaRecensioni();
        }
      });
    });
  }
}
