import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RecensioneService } from '../../services/recensione.service';
import { iRecensioneRequest } from '../../interfaces/i-recensione-request';

@Component({
  selector: 'app-review-dialog',
  templateUrl: './review-dialog.component.html',
  styleUrls: ['./review-dialog.component.scss'],
})
export class ReviewDialogComponent {
  stelleSelezionate: number = 0;
  hoverStelle: number = 0;
  commento: string = '';

  constructor(
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { mentorId: number; studenteId: number },
    private recensioneService: RecensioneService
  ) {}

  setStelle(stelle: number) {
    this.stelleSelezionate = stelle;
  }

  confermaRecensione() {
    if (this.stelleSelezionate === 0) return;

    const recensione: iRecensioneRequest = {
      mentorId: this.data.mentorId,
      stelle: this.stelleSelezionate,
      commento: this.commento,
    };

    this.recensioneService
      .aggiungiRecensione(this.data.studenteId, recensione)
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  chiudi() {
    this.dialogRef.close(false);
  }
}
