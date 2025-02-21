import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MentorProfileComponent } from './mentor-profile.component';

const routes: Routes = [{ path: '', component: MentorProfileComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MentorProfileRoutingModule { }
