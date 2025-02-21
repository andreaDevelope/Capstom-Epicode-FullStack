import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WelcomeRoutingModule } from './welcome-routing.module';
import { WelcomeComponent } from './welcome.component';
import { AuthService } from '../../services/auth.service';
import { HeaderModule } from '../../main-components/header/header.module';

@NgModule({
  declarations: [WelcomeComponent],
  imports: [CommonModule, WelcomeRoutingModule, HeaderModule],
  providers: [AuthService],
})
export class WelcomeModule {}
