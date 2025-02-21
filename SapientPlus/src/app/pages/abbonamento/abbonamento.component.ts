import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PayPalService } from '../../services/pay-pal.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { iPayPalOrder } from '../../interfaces/i-pay-pal-order';
import { iPayPalAction } from '../../interfaces/i-pay-pal-action';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../atomic-components/dialog/dialog.component';

@Component({
  selector: 'app-abbonamento',
  templateUrl: './abbonamento.component.html',
  styleUrls: ['./abbonamento.component.scss'],
})
export class AbbonamentoComponent implements OnInit {
  isBrowser: boolean;

  constructor(
    private payPalService: PayPalService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    if (this.isBrowser) {
      this.authService.restoreUser();
      await new Promise((resolve) => setTimeout(resolve, 300));
      await this.loadPayPalScript();
      this.renderPayPalButton();
    }
  }

  showDialog(title: string, message: string): void {
    this.dialog.open(DialogComponent, {
      data: { title, message },
    });
  }

  loadPayPalScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        'https://www.paypal.com/sdk/js?client-id=Ae3ahYa3vR2PTTKpftbD3SU_zI5nCUAktze5OjMkCZtEEOQRQFcdQk3wCrkit9890K4pSoAA2axVIjTX&currency=EUR';

      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject('Errore nel caricamento dello script PayPal');
      document.body.appendChild(script);
    });
  }

  renderPayPalButton(): void {
    if (this.isBrowser && window.paypal) {
      window.paypal
        .Buttons({
          createOrder: (data: iPayPalOrder, actions: iPayPalAction) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: '20.00',
                    currency_code: 'EUR',
                  },
                  description: 'Abbonamento Annuale',
                },
              ],
            });
          },
          onApprove: async (data: iPayPalOrder, actions: iPayPalAction) => {
            const order = await actions.order.capture();
            this.showDialog(
              'Pagamento completato con successo!',
              'complimenti'
            );

            try {
              const obs = await this.payPalService.attivaAbbonamento();

              obs.subscribe({
                next: (res) => {
                  this.showDialog(
                    'Abbonamento attivato con successo!',
                    'sei un nuovo mentor di Sapient+'
                  );
                  this.authService.refreshToken().subscribe({
                    next: () => {
                      this.router.navigate(['/mentor-home']);
                    },
                    error: (err) => {
                      console.error('Errore aggiornamento token:', err);
                    },
                  });

                  this.authService.restoreUser();
                  this.router.navigate(['/mentor-home']);
                },
                error: (err) => {
                  console.error('Errore durante l’attivazione:', err);
                  this.showDialog(
                    'riprova',
                    'Errore durante l’attivazione dell’abbonamento.'
                  );
                },
              });
            } catch (err) {
              console.error('Errore attivazione abbonamento:', err);
              this.showDialog(
                'riprova',
                'Errore durante l’attivazione dell’abbonamento (catch).'
              );
            }
          },
          onError: (err: unknown) => {
            console.error('Errore durante il pagamento:', err);
            this.showDialog(
              'riprova',
              'Si è verificato un errore durante il pagamento.'
            );
          },
        })
        .render('#paypal-button-container');
    } else {
      console.error('PayPal SDK non disponibile.');
    }
  }
}
