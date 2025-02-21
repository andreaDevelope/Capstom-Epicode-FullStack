import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit {
  message: string = 'Verifica in corso...';
  isError: boolean = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.authService.verifyEmail(token).subscribe({
          next: (response) => {
            this.message = 'Email verificata con successo! Ora puoi accedere.';
            setTimeout(() => this.router.navigate(['/login']), 3000);
          },
          error: () => {
            this.message =
              'Verifica fallita. Il token potrebbe essere scaduto.';
            this.isError = true;
          },
        });
      } else {
        this.message = 'Token non valido.';
        this.isError = true;
      }
    });
  }
}
