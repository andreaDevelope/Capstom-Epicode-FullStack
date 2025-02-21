import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MentorProfileViewComponent } from './mentor-profile-view.component';
import { RouterModule, Routes } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [{ path: '', component: MentorProfileViewComponent }];

@NgModule({
  declarations: [MentorProfileViewComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class MentorProfileViewModule {}
