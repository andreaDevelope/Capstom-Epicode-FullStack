import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbbonamentoComponent } from './abbonamento.component';
import { AbbonamentoRoutingModule } from './abbonamento-routing.module';
import { HeaderModule } from '../../main-components/header/header.module';

@NgModule({
  declarations: [AbbonamentoComponent],
  imports: [CommonModule, AbbonamentoRoutingModule, HeaderModule],
})
export class AbbonamentoModule {}
