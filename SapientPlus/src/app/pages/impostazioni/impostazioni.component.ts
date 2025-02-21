import {
  Component,
  Renderer2,
  ViewChild,
  OnInit,
  Inject,
  PLATFORM_ID,
  ElementRef,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-impostazioni',
  templateUrl: './impostazioni.component.html',
  styleUrls: ['./impostazioni.component.scss'],
})
export class ImpostazioniComponent implements OnInit {
  isLoggedIn: boolean = false;
  isDarkMode: boolean = false;
  reduceMotion: boolean = false;
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('sidenavContainer') sidenavContainer!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(
      (status) => (this.isLoggedIn = status)
    );

    if (isPlatformBrowser(this.platformId)) {
      this.isDarkMode = this.cookieService.get('darkMode') === 'true';
      this.reduceMotion = this.cookieService.get('reduceMotion') === 'true';

      if (this.isDarkMode) {
        this.renderer.addClass(document.body, 'dark-mode');
      } else {
        this.renderer.removeClass(document.body, 'dark-mode');
      }

      if (this.reduceMotion) {
        this.renderer.addClass(document.body, 'reduce-motion');
      } else {
        this.renderer.removeClass(document.body, 'reduce-motion');
      }
    }
  }

  onDarkModeChange(checked: boolean): void {
    this.isDarkMode = checked;
    this.cookieService.set('darkMode', String(this.isDarkMode));

    if (isPlatformBrowser(this.platformId)) {
      if (this.isDarkMode) {
        this.renderer.addClass(document.body, 'dark-mode');
      } else {
        this.renderer.removeClass(document.body, 'dark-mode');
      }
    }
  }

  onReduceMotionChange(checked: boolean): void {
    this.reduceMotion = checked;
    this.cookieService.set('reduceMotion', String(this.reduceMotion));

    if (isPlatformBrowser(this.platformId)) {
      if (this.reduceMotion) {
        this.renderer.addClass(document.body, 'reduce-motion');
      } else {
        this.renderer.removeClass(document.body, 'reduce-motion');
      }
    }
  }

  resetSettings(): void {
    this.cookieService.delete('darkMode');
    this.cookieService.delete('reduceMotion');

    this.isDarkMode = false;
    this.reduceMotion = false;

    if (isPlatformBrowser(this.platformId)) {
      this.renderer.removeClass(document.body, 'dark-mode');
      this.renderer.removeClass(document.body, 'reduce-motion');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
