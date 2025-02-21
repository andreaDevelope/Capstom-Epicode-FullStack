import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MentorProfileRoutingModule } from './mentor-profile-routing.module';
import { MentorProfileComponent } from './mentor-profile.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [MentorProfileComponent],
  imports: [
    CommonModule,
    MentorProfileRoutingModule,
    MatButtonModule,
    MatDividerModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    FormsModule,
  ],
})
export class MentorProfileModule {}
