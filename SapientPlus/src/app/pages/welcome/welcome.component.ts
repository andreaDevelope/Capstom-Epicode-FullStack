import {
  Component,
  AfterViewInit,
  PLATFORM_ID,
  Inject,
  Renderer2,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { RegisterDialogComponent } from '../../atomic-components/register-dialog/register-dialog.component';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements AfterViewInit {
  @ViewChildren('presentazioneEl')
  presentazioneElements!: QueryList<ElementRef>;

  constructor(
    private dialog: MatDialog,
    @Inject(PLATFORM_ID) private platformId: object,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.renderer.addClass(entry.target, 'visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      this.presentazioneElements.forEach((el) => {
        observer.observe(el.nativeElement);
      });
    }
  }

  openRegisterDialog(): void {
    const dialogWidth = window.innerWidth < 600 ? '90vw' : '450px';
    const dialogHeight = 'auto';
    const maxDialogHeight = '80vh';

    const dialogRef = this.dialog.open(RegisterDialogComponent, {
      width: dialogWidth,
      height: dialogHeight,
      maxHeight: maxDialogHeight,
      disableClose: false,
    });

    setTimeout(() => {
      dialogRef.updateSize();
    }, 0);
  }
}
