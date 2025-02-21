import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  selectedIndex = 0;
  routes = ['/', '/login'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateSelectedIndex(this.router.url);

    // Ascolta i cambiamenti di rotta per aggiornare l'index quando cambia l'URL
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateSelectedIndex(event.urlAfterRedirects);
      }
    });
  }

  updateSelectedIndex(currentRoute: string) {
    const foundIndex = this.routes.indexOf(currentRoute);
    this.selectedIndex = foundIndex !== -1 ? foundIndex : 0;
  }

  navigate(index: number): void {
    if (index < 0 || index >= this.routes.length) {
      console.error('ERRORE: Indice tab non valido:', index);
      return;
    }

    const targetRoute = this.routes[index];

    this.router.navigateByUrl(targetRoute).catch((err) => {
      console.error('ERRORE di navigazione:', err);
    });
  }
}
