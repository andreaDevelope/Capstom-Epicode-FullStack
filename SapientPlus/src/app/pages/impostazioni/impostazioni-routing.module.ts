import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImpostazioniComponent } from './impostazioni.component';

const routes: Routes = [{ path: '', component: ImpostazioniComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImpostazioniRoutingModule { }
