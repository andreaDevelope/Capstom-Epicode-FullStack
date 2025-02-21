import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ImpostazioniRoutingModule } from './impostazioni-routing.module';
import { ImpostazioniComponent } from './impostazioni.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ImpostazioniComponent],
  imports: [
    CommonModule,
    RouterModule,
    ImpostazioniRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSlideToggleModule,
    FormsModule,
  ],
})
export class ImpostazioniModule {}
