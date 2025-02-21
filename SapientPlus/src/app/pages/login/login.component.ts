import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { iLoginRequest } from '../../interfaces/i-login-request';
import { AuthService } from '../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm!: FormGroup;
  loginError: string | null = null;
  hidePassword: boolean = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  login() {
    if (this.loginForm.valid) {
      const authData: iLoginRequest = this.loginForm.value;

      this.authService.login(authData).subscribe({
        next: () => {
          const accessData = this.cookieService.get('accessData');

          if (accessData) {
            try {
              const parsedAccessData = JSON.parse(accessData);
              const userRole = parsedAccessData?.user?.ruolo;
              const primoLogin = parsedAccessData?.primoLogin;

              console.log('User Role:', userRole);
              console.log('Primo Login:', primoLogin);

              if (typeof userRole === 'string') {
                if (userRole === 'ROLE_STUDENT' && primoLogin) {
                  this.router.navigate(['/profile']);
                } else {
                  switch (userRole) {
                    case 'ROLE_STUDENT':
                      this.router.navigate(['/student-home']);
                      break;
                    case 'ROLE_MENTOR':
                      this.router.navigate(['/mentor-home']);
                      break;
                    case 'ROLE_ADMIN':
                      this.router.navigate(['/admin-home']);
                      break;
                    default:
                      console.error('Ruolo non riconosciuto:', userRole);
                      this.router.navigate(['/login']);
                  }
                }
              } else {
                console.error('Ruolo non valido:', userRole);
                this.router.navigate(['/login']);
              }
            } catch (error) {
              console.error('Errore nel parsing del cookie accessData:', error);
              this.router.navigate(['/login']);
            }
          } else {
            console.error('Cookie accessData non trovato.');
            this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          this.loginError = 'Credenziali non valide. Riprova.';
          console.error('Errore durante il login:', error);
        },
      });
    }
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  isPasswordGifVisible: boolean = false;
  isDefaultGifVisible: boolean = true;

  showPasswordGif() {
    this.isPasswordGifVisible = true;
    this.isDefaultGifVisible = false;
    this.cdr.detectChanges();
  }

  hidePasswordGif() {
    setTimeout(() => {
      this.isPasswordGifVisible = false;
      this.isDefaultGifVisible = true;
      this.cdr.detectChanges();
    }, 200);
  }
}
