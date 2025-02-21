import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbbonamentoComponent } from './abbonamento.component';

const routes: Routes = [{ path: '', component: AbbonamentoComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbbonamentoRoutingModule { }
